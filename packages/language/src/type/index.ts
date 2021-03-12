import { produce, immerable } from "immer";
import { InferError } from "./InferError";

export { InferError };

export const typeNames = ["number", "string", "boolean"];

export type TypeName = typeof typeNames[number];

export interface FunctionType {
  returns: Type;
}

const intersect = (a1: TypeName[], a2: TypeName[]): TypeName[] =>
  a1.filter((t) => a2.includes(t));

const matchUnits = (u1: AST.Unit, u2: AST.Unit) =>
  u1.unit === u2.unit && u1.exp === u2.exp;

const matchUnitColumns = (units1: AST.Unit[], units2: AST.Unit[]) => {
  if (units1.length !== units2.length) return false;
  return units1.every((u1, i) => matchUnits(u1, units2[i]));
};

const normalizeUnits = (units: AST.Unit[] | null) => {
  if (units == null) {
    return null;
  }

  const normalized = units.filter((u) => u.exp !== 0);

  if (normalized.length === 0) {
    return null;
  } else {
    return normalized.sort((a, b) => {
      if (a.unit > b.unit) {
        return 1;
      } else if (a.unit < b.unit) {
        return -1;
      } else {
        return 0;
      }
    });
  }
};

export const multiplyExponent = (unit: AST.Unit, multiplier: number) =>
  produce(unit, (unit) => {
    unit.exp *= multiplier;
  });

export const inverseExponent = (unit: AST.Unit) => multiplyExponent(unit, -1);

const multipliersToPrefixes: Record<number, string> = {
  1e-18: "a",
  1e-15: "f",
  1e-12: "p",
  1e-9: "n",
  1e-6: "μ",
  1e-3: "m",
  1e-2: "c",
  1e-1: "d",
  1: "",
  1e1: "da",
  1e2: "h",
  1e3: "k",
  1e6: "M",
  1e9: "g",
  1e12: "t",
  1e15: "p",
  1e18: "e",
  1e21: "z",
  1e24: "y",
};

const stringifyUnit = (unit: AST.Unit) => {
  const result = [multipliersToPrefixes[unit.multiplier], unit.unit];

  if (unit.exp !== 1) {
    result.push(`^${unit.exp}`);
  }

  return result.join("");
};

const stringifyUnits = (unit: AST.Unit[]) =>
  unit.map((unit) => stringifyUnit(unit)).join(".");

const combineUnits = (
  myUnits: AST.Unit[] | null,
  theirUnits: AST.Unit[] | null
) => {
  myUnits = normalizeUnits(myUnits) ?? [];
  theirUnits = normalizeUnits(theirUnits) ?? [];

  const existingUnits = new Set([...myUnits.map((u) => u.unit)]);
  const outputUnits: AST.Unit[] = [...myUnits];

  // Combine their units in
  for (const theirUnit of theirUnits) {
    if (!existingUnits.has(theirUnit.unit)) {
      // m * s => m.s
      outputUnits.push(theirUnit);
    } else {
      // m^2 * m => m^3
      const existingUnitIndex = myUnits.findIndex(
        (u) => u.unit === theirUnit.unit
      );
      outputUnits[existingUnitIndex] = produce(
        outputUnits[existingUnitIndex],
        (inversed) => {
          inversed.exp += theirUnit.exp;
        }
      );
    }
  }

  return normalizeUnits(outputUnits);
};

export class Type {
  [immerable] = true;

  static Number = new Type("number");
  static String = new Type("string");
  static Boolean = new Type("boolean");
  static Impossible = produce(new Type("number"), (impossibleType) => {
    impossibleType.possibleTypes = [];
  });

  possibleTypes = typeNames;
  unit: AST.Unit[] | null = null;
  node: AST.Node;
  errorCause: InferError | null = null;
  columnSize: number | null = null

  constructor(...possibleTypes: TypeName[]) {
    if (possibleTypes.length > 0) {
      this.possibleTypes = possibleTypes;
    }
  }

  toString() {
    if (this.unit != null && this.unit.length > 0) {
      return stringifyUnits(this.unit);
    }

    return `<${this.possibleTypes.join(", or ")}>`;
  }

  // Return the first type that has an error, or the last one.
  static combine(...types: Type[]): Type {
    for (let i = 0; i < types.length; i++) {
      if (types[i].errorCause != null || i === types.length - 1) {
        return types[i];
      }
    }

    throw new Error("panic: Type.combine() called with 0 arguments");
  }

  static runFunctor(
    sourceNode: AST.Node,
    functor: (...args: Type[]) => Type,
    ...args: Type[]
  ): Type {
    const impossibleArg = args.find((arg) => arg.errorCause != null);

    if (impossibleArg != null) {
      return impossibleArg;
    }

    const ret = functor(...args);

    if (ret.errorCause != null) {
      return ret.inNode(sourceNode);
    }

    return ret;
  }

  inNode(node: AST.Node) {
    return produce(this, (newType) => {
      newType.node = node;
    });
  }

  hasType(...typeNames: TypeName[]): Type {
    if (this.errorCause != null) return this;

    const intersection = intersect(this.possibleTypes, typeNames);

    if (intersection.length === 0) {
      return this.withErrorCause(
        new InferError(
          "Mismatched types: " +
            this.possibleTypes.join(", ") +
            " and " +
            typeNames.join(", ")
        )
      );
    }

    return produce(this, (newType) => {
      newType.possibleTypes = intersection;
    });
  }

  isColumn(size: number) {
    const incompatibleSizes = this.columnSize != null && this.columnSize !== size

    if (incompatibleSizes) {
      return this.withErrorCause(new InferError(
        "Incompatible column sizes: " + this.columnSize + ' and ' + size
      ))
    } else {
      return produce(this, newType => {
        newType.columnSize = size
      })
    }
  }

  isNotColumn() {
    if (this.columnSize != null) {
      return this.withErrorCause(new InferError('Unexpected column'))
    } else {
      return this
    }
  }

  sameColumnSizeAs(other: Type) {
    if (this.columnSize === other.columnSize) {
      return this
    } else if ((this.columnSize == null) !== (other.columnSize == null)) {
      // Only one is an column
      return produce(this, newType => {
        newType.columnSize = this.columnSize ?? other.columnSize
      })
    } else {
      return this.withErrorCause(new InferError(
        `Incompatible column sizes: ${this.columnSize} and ${other.columnSize}`
      ))
    }
  }

  sameAs(other: Type): Type {
    if (this.errorCause != null) return this;
    if (other.errorCause != null) return other;

    return this.hasType(...other.possibleTypes).sameColumnSizeAs(other);
  }

  withUnit(unit: AST.Unit[] | null) {
    if (this.errorCause != null) return this;

    if (this.unit == null || unit == null) {
      return produce(this, (newType) => {
        newType.unit = unit;
      });
    } else {
      if (!matchUnitColumns(this.unit, unit)) {
        return this.withErrorCause(
          new InferError(
            "Mismatched units: " +
              stringifyUnits(this.unit) +
              " and " +
              stringifyUnits(unit)
          )
        );
      }

      return this;
    }
  }

  multiplyUnit(withUnits: AST.Unit[] | null) {
    if (this.errorCause != null) return this;

    return produce(this, (newType) => {
      newType.unit = combineUnits(this.unit, withUnits);
    });
  }

  divideUnit(withUnit: AST.Unit[] | null) {
    if (this.errorCause != null) return this;

    const theirUnits =
      withUnit == null ? null : withUnit.map((u) => inverseExponent(u));

    return this.multiplyUnit(theirUnits);
  }

  withErrorCause(error: InferError) {
    if (this.errorCause != null) return this;

    return produce(this, (newType) => {
      newType.possibleTypes = [];
      newType.unit = null;
      newType.errorCause = error;
    });
  }
}
