import { produce, immerable } from 'immer';
import { InferError } from './InferError';

export { InferError };

export const typeNames = ['number', 'string', 'boolean'];

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
  1e-18: 'a',
  1e-15: 'f',
  1e-12: 'p',
  1e-9: 'n',
  1e-6: 'μ',
  1e-3: 'm',
  1e-2: 'c',
  1e-1: 'd',
  1: '',
  1e1: 'da',
  1e2: 'h',
  1e3: 'k',
  1e6: 'M',
  1e9: 'g',
  1e12: 't',
  1e15: 'p',
  1e18: 'e',
  1e21: 'z',
  1e24: 'y',
};

const stringifyUnit = (unit: AST.Unit) => {
  const result = [multipliersToPrefixes[unit.multiplier], unit.unit];

  if (unit.exp !== 1) {
    result.push(`^${unit.exp}`);
  }

  return result.join('');
};

const stringifyUnits = (unit: AST.Unit[]) =>
  unit.map((unit) => stringifyUnit(unit)).join('.');

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

// decorates methods that propagate errors found in `this` or any argument.
const propagate = (_: Type, _methodName: string, desc: PropertyDescriptor) => {
  const method = desc.value;

  desc.value = function (this: Type, ...args: any[]) {
    const errored = [this, ...args].find(
      (a) => a instanceof Type && a.errorCause != null
    );

    return errored ?? method.call(this, ...args);
  };
};

export class Type {
  [immerable] = true;

  static Number = new Type('number');
  static String = new Type('string');
  static Boolean = new Type('boolean');
  static Impossible = produce(new Type('number'), (impossibleType) => {
    impossibleType.possibleTypes = [];
  });

  possibleTypes = typeNames;
  unit: AST.Unit[] | null = null;
  node: AST.Node;
  errorCause: InferError | null = null;
  columnSize: number | null = null;
  rangeness: boolean | null = null;

  constructor(...possibleTypes: TypeName[]) {
    if (possibleTypes.length > 0) {
      this.possibleTypes = possibleTypes;
    }
  }

  toString(): string {
    if (this.rangeness === true) {
      const withoutRange = produce(this, (type) => {
        type.rangeness = null;
      });

      return 'range of ' + withoutRange.toString();
    }

    if (this.unit != null && this.unit.length > 0) {
      return stringifyUnits(this.unit);
    }

    return `<${this.possibleTypes.join(', or ')}>`;
  }

  // Return the first type that has an error, or the last one.
  static combine(...types: Type[]): Type {
    for (let i = 0; i < types.length; i++) {
      if (types[i].errorCause != null || i === types.length - 1) {
        return types[i];
      }
    }

    throw new Error('panic: Type.combine() called with 0 arguments');
  }

  static runFunctor<ArgsT extends Type[]>(
    sourceNode: AST.Node,
    functor: (...args: ArgsT) => Type,
    ...args: ArgsT
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

  @propagate
  hasType(...typeNames: TypeName[]): Type {
    const intersection = intersect(this.possibleTypes, typeNames);

    if (intersection.length === 0) {
      return this.withErrorCause(
        new InferError(
          'Mismatched types: ' +
            this.possibleTypes.join(', ') +
            ' and ' +
            typeNames.join(', ')
        )
      );
    }

    return produce(this, (newType) => {
      newType.possibleTypes = intersection;
    });
  }

  @propagate
  isColumn(size: number) {
    const incompatibleSizes =
      this.columnSize != null && this.columnSize !== size;

    if (incompatibleSizes) {
      return this.withErrorCause(
        new InferError(
          `Incompatible column sizes: ${String(this.columnSize)} and ${String(
            size
          )}`
        )
      );
    } else {
      return produce(this, (newType) => {
        newType.columnSize = size;
      });
    }
  }

  @propagate
  isNotColumn() {
    if (this.columnSize != null) {
      return this.withErrorCause(new InferError('Unexpected column'));
    } else {
      return this;
    }
  }

  @propagate
  sameColumnSizeAs(other: Type) {
    if (this.columnSize === other.columnSize) {
      return this;
    } else if ((this.columnSize == null) !== (other.columnSize == null)) {
      // Only one is an column
      return produce(this, (newType) => {
        newType.columnSize = this.columnSize ?? other.columnSize;
      });
    } else {
      return this.withErrorCause(
        new InferError(
          `Incompatible column sizes: ${String(this.columnSize)} and ${String(
            other.columnSize
          )}`
        )
      );
    }
  }

  @propagate
  isRange() {
    if (this.rangeness === false) {
      return this.withErrorCause(new InferError('Expected range'));
    } else {
      return produce(this, (newType) => {
        newType.rangeness = true;
      });
    }
  }

  @propagate
  isNotRange() {
    if (this.rangeness === true) {
      return this.withErrorCause(new InferError('Unexpected range'));
    } else {
      return produce(this, (newType) => {
        newType.rangeness = false;
      });
    }
  }

  @propagate
  sameRangenessAs(other: Type): Type {
    if (this.rangeness === other.rangeness) {
      return this;
    } else if ((this.rangeness == null) !== (other.rangeness == null)) {
      // Only one is a range
      return produce(this, (newType) => {
        newType.rangeness = this.rangeness ?? other.rangeness;
      });
    } else {
      return this.withErrorCause(
        new InferError(
          'Expected type with rangeness ' +
            this.rangeness +
            ' to have rangeness ' +
            other.rangeness
        )
      );
    }
  }

  @propagate
  sameAs(other: Type): Type {
    return this.hasType(...other.possibleTypes)
      .sameColumnSizeAs(other)
      .sameRangenessAs(other);
  }

  @propagate
  withUnit(unit: AST.Unit[] | null) {
    if (this.unit == null || unit == null) {
      return produce(this, (newType) => {
        newType.unit = unit;
      });
    } else {
      if (!matchUnitColumns(this.unit, unit)) {
        return this.withErrorCause(
          new InferError(
            'Mismatched units: ' +
              stringifyUnits(this.unit) +
              ' and ' +
              stringifyUnits(unit)
          )
        );
      }

      return this;
    }
  }

  @propagate
  multiplyUnit(withUnits: AST.Unit[] | null) {
    if (this.rangeness === true) {
      return this.withErrorCause(new InferError('Invalid method for a range'));
    }

    return produce(this, (newType) => {
      newType.unit = combineUnits(this.unit, withUnits);
    });
  }

  @propagate
  divideUnit(withUnit: AST.Unit[] | null) {
    if (this.rangeness === true) {
      return this.withErrorCause(new InferError('Invalid method for a range'));
    }

    const theirUnits =
      withUnit == null ? null : withUnit.map((u) => inverseExponent(u));

    return this.multiplyUnit(theirUnits);
  }

  @propagate
  withErrorCause(error: InferError) {
    return produce(this, (newType) => {
      newType.possibleTypes = [];
      newType.unit = null;
      newType.errorCause = error;
    });
  }
}

export class TableType {
  [immerable] = true;
  constructor(public columnDefs: Map<string, Type>) {}

  toString() {
    const columns = [...this.columnDefs.entries()]
      .map(([col, value]) => {
        return `${col} = ${value.toString()}`;
      })
      .join(', ');
    return `table { ${columns} }`;
  }
}
