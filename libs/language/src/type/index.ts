import { immerable, produce } from 'immer';
import { DateSpecificity } from '../date';
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

interface ExtendArgs {
  type?: string | string[];
  unit?: AST.Unit[] | null;
  columnSize?: number | null;
  rangeness?: boolean;
  date?: DateSpecificity | null;
}

export class Type {
  [immerable] = true;

  static Number: Type;
  static String: Type;
  static Boolean: Type;
  static Impossible: Type;
  possibleTypes = typeNames;
  unit: AST.Unit[] | null = null;
  node: AST.Node;
  errorCause: InferError | null = null;
  columnSize: number | null = null;
  rangeness = false;
  date: DateSpecificity | null;

  static extend(
    base: Type,
    { type, unit, columnSize, rangeness, date }: ExtendArgs
  ) {
    return produce(base, (t) => {
      if (type !== undefined) {
        t.possibleTypes = Array.isArray(type) ? type : [type];
      }

      if (unit !== undefined) {
        t.unit = unit;
      }

      if (columnSize !== undefined) {
        t.columnSize = columnSize;
      }

      if (rangeness !== undefined) {
        t.rangeness = rangeness;
      }

      if (date !== undefined) {
        t.date = date;
      }
    });
  }

  static build(extendArgs: ExtendArgs) {
    return Type.extend(new Type(), extendArgs);
  }

  static buildDate(specificity: DateSpecificity) {
    return Type.build({
      type: 'number',
      date: specificity,
    });
  }

  constructor(...possibleTypes: TypeName[]) {
    if (possibleTypes.length > 0) {
      this.possibleTypes = possibleTypes;
    }
  }

  toString(): string {
    if (this.rangeness === true) {
      const withoutRange = produce(this, (type) => {
        type.rangeness = false;
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

    if (intersection.length > 0) {
      return produce(this, (newType) => {
        newType.possibleTypes = intersection;
      });
    } else {
      return this.withErrorCause(
        new InferError(
          'Mismatched types: ' +
            this.possibleTypes.join(', ') +
            ' and ' +
            typeNames.join(', ')
        )
      );
    }
  }

  @propagate
  isColumn(size: number) {
    if (this.columnSize === size) {
      return this;
    } else {
      return this.withErrorCause(
        new InferError(
          `Incompatible column sizes: ${String(this.columnSize)} and ${String(
            size
          )}`
        )
      );
    }
  }

  @propagate
  isNotColumn() {
    if (this.columnSize == null) {
      return this;
    } else {
      return this.withErrorCause(new InferError('Unexpected column'));
    }
  }

  @propagate
  withColumnSize(columnSize: number | null) {
    if (this.columnSize === columnSize) {
      return this;
    } else if ((this.columnSize == null) !== (columnSize == null)) {
      // Only one is an column
      return produce(this, (newType) => {
        newType.columnSize = this.columnSize ?? columnSize;
      });
    } else {
      return this.withErrorCause(
        new InferError(
          `Incompatible column sizes: ${String(this.columnSize)} and ${String(
            columnSize
          )}`
        )
      );
    }
  }

  @propagate
  sameColumnSizeAs(other: Type) {
    return this.withColumnSize(other.columnSize);
  }

  @propagate
  isRange() {
    if (this.rangeness === true) {
      return this;
    } else {
      return this.withErrorCause(new InferError('Expected range'));
    }
  }

  @propagate
  isNotRange() {
    if (this.rangeness === false) {
      return this;
    } else {
      return this.withErrorCause(new InferError('Unexpected range'));
    }
  }

  @propagate
  sameRangenessAs(other: Type): Type {
    if (this.rangeness === other.rangeness) {
      return this;
    } else {
      const errorMessage = this.rangeness
        ? 'Expected range'
        : 'Unexpected range';

      return this.withErrorCause(new InferError(errorMessage));
    }
  }

  @propagate
  isDate(specificity?: DateSpecificity): Type {
    if (this.date != null) {
      if (specificity == null || specificity === this.date) {
        return this;
      } else {
        return this.withErrorCause(
          new InferError('Expected date with ' + specificity + ' specificity')
        );
      }
    } else {
      return this.withErrorCause(new InferError('Expected date'));
    }
  }

  @propagate
  isNotDate(): Type {
    if (this.date == null) {
      return this;
    } else {
      return this.withErrorCause(new InferError('Unexpected date'));
    }
  }

  @propagate
  sameDatenessAs(other: Type): Type {
    if (this.date == other.date) {
      return this;
    } else {
      if ((this.date == null) === (other.date == null)) {
        return this.withErrorCause(
          new InferError('Expected date with ' + other.date + ' specificity')
        );
      } else {
        const errorMessage =
          this.date != null ? 'Unexpected date' : 'Expected date';
        return this.withErrorCause(new InferError(errorMessage));
      }
    }
  }

  @propagate
  sameAs(other: Type): Type {
    return this.hasType(...other.possibleTypes)
      .sameColumnSizeAs(other)
      .sameDatenessAs(other)
      .sameRangenessAs(other);
  }

  @propagate
  withUnit(unit: AST.Unit[] | null) {
    if (matchUnitColumns(this.unit ?? [], unit ?? [])) {
      return this;
    } else {
      return this.withErrorCause(
        new InferError(
          'Mismatched units: ' +
            stringifyUnits(this.unit ?? []) +
            ' and ' +
            stringifyUnits(unit ?? [])
        )
      );
    }
  }

  @propagate
  multiplyUnit(withUnits: AST.Unit[] | null) {
    return produce(this, (newType) => {
      newType.unit = combineUnits(this.unit, withUnits);
    });
  }

  @propagate
  divideUnit(withUnit: AST.Unit[] | null) {
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

Type.Number = new Type('number');
Type.String = new Type('string');
Type.Boolean = new Type('boolean');
Type.Impossible = produce(new Type('number'), (impossibleType) => {
  impossibleType.possibleTypes = [];
});

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
