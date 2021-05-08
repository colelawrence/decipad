import { immerable, produce } from 'immer';
import { getDefined } from '../utils';
import type { DateSpecificity } from '../date';
import { InferError } from './InferError';
import {
  inverseExponent,
  setExponent,
  combineUnits,
  matchUnitColumns,
  stringifyUnits,
} from './units';

export { InferError, inverseExponent, setExponent };

export const scalarTypeNames = ['number', 'string', 'boolean'];

export type TypeName = typeof scalarTypeNames[number];

// decorates methods that propagate errors found in `this` or any argument.
const propagate = (_: Type, _methodName: string, desc: PropertyDescriptor) => {
  const method = desc.value;

  desc.value = function (this: Type, ...args: any[]) {
    if (
      this.functionness ||
      args.some((a) => a instanceof Type && a.functionness)
    ) {
      throw new Error('panic: functions cannot be used');
    }

    const errored = [this, ...args].find(
      (a) => a instanceof Type && a.errorCause != null
    );

    return errored ?? method.call(this, ...args);
  };
};

export interface ExtendArgs {
  type?: TypeName;
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
  static FunctionPlaceholder: Type;

  type: string | null = null;
  unit: AST.Unit[] | null = null;
  node: AST.Node;
  errorCause: InferError | null = null;
  rangeness = false;
  date: DateSpecificity | null;

  // Column
  cellType: Type | null = null;
  columnSize: number | null = null;

  // Tuple
  tupleTypes: Type[] | null = null;
  tupleNames: string[] | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;

  private constructor() {}

  static extend(
    base: Type,
    { type, unit, columnSize, rangeness, date }: ExtendArgs
  ): Type {
    if (columnSize != null) {
      const t = Type.extend(base, { type, unit, rangeness, date });

      return Type.buildColumn(t, columnSize);
    }

    return produce(base, (t) => {
      if (type !== undefined) {
        t.type = type;
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

  static buildScalar(type: TypeName) {
    return Type.build({ type });
  }

  static buildColumn(cellType: Type, columnSize: number) {
    const t = new Type();

    t.cellType = cellType;
    t.columnSize = columnSize;

    if (cellType.errorCause != null) {
      return t.withErrorCause(cellType.errorCause);
    } else {
      return t;
    }
  }

  static buildTuple(tupleTypes: Type[], tupleNames?: string[] | null) {
    const t = new Type();

    t.tupleTypes = tupleTypes;
    t.tupleNames = tupleNames ?? null;

    const errored = t.tupleTypes.find((t) => t.errorCause != null);

    if (errored != null) {
      return t.withErrorCause(getDefined(errored.errorCause));
    } else {
      return t;
    }
  }

  static buildListLike(types: Type[]) {
    const unified = types.reduce((a, b) => a.sameAs(b));

    if (unified.errorCause) {
      return Type.buildTuple(types);
    } else {
      return Type.buildColumn(unified, types.length);
    }
  }

  static buildDate(specificity: DateSpecificity) {
    return Type.build({ type: 'number', date: specificity });
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

  toString(): string {
    if (this.errorCause != null) {
      return `Error: ${this.errorCause.message}`;
    }

    if (this.columnSize != null) {
      return `${this.cellType?.toString()} x ${this.columnSize}`;
    }

    if (this.tupleTypes != null) {
      const columnStrings = this.tupleTypes.map((cell, i) => {
        const name = this.tupleNames?.[i];

        if (name) {
          return `${name} = ${cell.toString()}`;
        } else {
          return cell.toString();
        }
      });

      return `[ ${columnStrings.join(', ')} ]`;
    }

    if (this.rangeness) {
      const withoutRange = produce(this, (type) => {
        type.rangeness = false;
      });

      return 'range of ' + withoutRange.toString();
    }

    if (this.unit != null && this.unit.length > 0) {
      return stringifyUnits(this.unit);
    }

    return `<${this.type}>`;
  }

  get cardinality(): number {
    if (this.tupleTypes != null) {
      return 1 + Math.max(...this.tupleTypes.map((c) => c.cardinality));
    } else if (this.cellType != null) {
      return 1 + this.cellType.cardinality;
    } else {
      return 1;
    }
  }

  mapType(fn: (t: Type) => Type) {
    if (this.errorCause) {
      return this;
    } else {
      return fn(this);
    }
  }

  inNode(node: AST.Node) {
    return produce(this, (newType) => {
      newType.node = node;
    });
  }

  @propagate
  withErrorCause(error: InferError | string): Type {
    if (typeof error === 'string') {
      return this.withErrorCause(new InferError(error));
    } else {
      return produce(this, (newType) => {
        newType.type = null;
        newType.unit = null;
        newType.errorCause = error;
      });
    }
  }

  // Type assertions -- these return a new type possibly with an error
  @propagate
  sameAs(other: Type): Type {
    return this.sameScalarnessAs(other)
      .sameColumnSizeAs(other)
      .sameDatenessAs(other)
      .sameRangenessAs(other);
  }

  @propagate
  isScalar(type?: TypeName | null) {
    if (
      this.tupleTypes == null &&
      this.cellType == null &&
      this.rangeness == false &&
      this.date == null
    ) {
      if (type == null || type === this.type) {
        return this;
      } else {
        return this.withErrorCause(`Expected ${type}`);
      }
    } else {
      return this.withErrorCause('Expected scalar');
    }
  }

  @propagate
  sameScalarnessAs(other: Type) {
    const meScalar =
      this.tupleTypes == null &&
      this.cellType == null &&
      this.rangeness == false &&
      this.date == null;
    const theyScalar =
      other.tupleTypes == null &&
      other.cellType == null &&
      other.rangeness == false &&
      other.date == null;

    if (meScalar == theyScalar) {
      return theyScalar ? this.isScalar(other.type) : this;
    } else if (meScalar) {
      return this.withErrorCause('Expected scalar');
    } else {
      return this.withErrorCause('Unexpected scalar');
    }
  }

  @propagate
  isColumn(size?: number) {
    if (
      (size === undefined && this.columnSize != null) ||
      this.columnSize === size
    ) {
      return this;
    } else {
      return this.withErrorCause(
        `Incompatible column sizes: ${this.columnSize} and ${size ?? 'any'}`
      );
    }
  }

  @propagate
  isNotColumn() {
    if (this.columnSize == null) {
      return this;
    } else {
      return this.withErrorCause('Unexpected column');
    }
  }

  @propagate
  reduced() {
    if (this.cellType != null) {
      return this.cellType;
    } else {
      return this.withErrorCause('Expected column');
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
        `Incompatible column sizes: ${this.columnSize} and ${columnSize}`
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
      return this.withErrorCause('Expected range');
    }
  }

  @propagate
  isNotRange() {
    if (this.rangeness === false) {
      return this;
    } else {
      return this.withErrorCause('Unexpected range');
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

      return this.withErrorCause(errorMessage);
    }
  }

  @propagate
  isDate(specificity?: DateSpecificity): Type {
    if (this.date != null) {
      if (specificity == null || specificity === this.date) {
        return this;
      } else {
        return this.withErrorCause(
          `Expected date with ${specificity} specificity`
        );
      }
    } else {
      return this.withErrorCause('Expected date');
    }
  }

  @propagate
  isNotDate(): Type {
    if (this.date == null) {
      return this;
    } else {
      return this.withErrorCause('Unexpected date');
    }
  }

  @propagate
  sameDatenessAs(other: Type): Type {
    if (this.date == other.date) {
      return this;
    } else {
      if ((this.date == null) === (other.date == null)) {
        return this.withErrorCause(
          `Expected date with ${other.date} specificity`
        );
      } else {
        const errorMessage =
          this.date != null ? 'Unexpected date' : 'Expected date';

        return this.withErrorCause(errorMessage);
      }
    }
  }

  @propagate
  withUnit(unit: AST.Unit[] | null) {
    if (matchUnitColumns(this.unit ?? [], unit ?? [])) {
      return this;
    } else {
      return this.withErrorCause(
        `Mismatched units: ${stringifyUnits(this.unit)} and ${stringifyUnits(
          unit
        )}`
      );
    }
  }

  @propagate
  multiplyUnit(withUnits: AST.Unit[] | null) {
    return Type.extend(this, { unit: combineUnits(this.unit, withUnits) });
  }

  @propagate
  divideUnit(withUnit: AST.Unit[] | null) {
    const theirUnits =
      withUnit == null ? null : withUnit.map((u) => inverseExponent(u));

    return Type.extend(this, { unit: combineUnits(this.unit, theirUnits) });
  }
}

Type.Number = Type.buildScalar('number');
Type.String = Type.buildScalar('string');
Type.Boolean = Type.buildScalar('boolean');
Type.Impossible = produce(Type.buildScalar('number'), (impossibleType) => {
  impossibleType.type = null;
});
Type.FunctionPlaceholder = produce(Type.Impossible, (fType) => {
  fType.functionness = true;
});
