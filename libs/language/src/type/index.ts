import { immerable, produce } from 'immer';
import { getDefined } from '../utils';
import { InferError } from './InferError';
import {
  inverseExponent,
  combineUnits,
  matchUnitArrays,
  stringifyUnits,
} from './units';

export { InferError, inverseExponent };

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

type TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong = Time.Specificity;

export interface ExtendArgs {
  type?: TypeName;
  unit?: AST.Unit[] | null;
  columnSize?: number | null;
  rangeness?: boolean;
  date?: Time.Specificity | null;
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

  date: Time.Specificity | null = null;

  rangeOf: Type | null = null;

  // Column
  cellType: Type | null = null;
  columnSize: number | null = null;

  // Tuple
  tupleTypes: Type[] | null = null;
  tupleNames: string[] | null = null;

  // Time quantities
  timeUnits: Time.Unit[] | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;

  private constructor() {}

  static extend(
    base: Type,
    { type, unit, columnSize, date }: ExtendArgs
  ): Type {
    if (base.errorCause != null) {
      return base;
    }

    if (columnSize !== undefined) {
      const t = Type.extend(base, { type, unit, date });

      return Type.buildColumn(
        t,
        getDefined(columnSize, 'unsupported: removing columnness')
      );
    }

    return produce(base, (t) => {
      if (type !== undefined) {
        t.type = type;
      }

      if (unit !== undefined) {
        t.unit = unit;
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

  static buildDate(specificity: Time.Specificity) {
    return Type.build({ date: specificity });
  }

  static buildRange(of: Type) {
    const t = new Type();
    t.rangeOf = of;
    return t;
  }

  static buildTimeQuantity(timeUnits: Time.Unit[]) {
    const t = new Type();
    t.timeUnits = timeUnits;
    return t;
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

    if (this.columnSize != null && this.cellType != null) {
      return `${this.cellType.toString()} x ${this.columnSize}`;
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

    if (this.rangeOf != null) {
      return 'range of ' + this.rangeOf.toString();
    }

    if (this.unit != null && this.unit.length > 0) {
      return stringifyUnits(this.unit);
    }

    if (this.date != null) {
      return this.date;
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
      .sameColumnessAs(other)
      .sameDatenessAs(other)
      .sameRangenessAs(other);
  }

  @propagate
  isScalar(type?: TypeName | null) {
    if (
      this.tupleTypes == null &&
      this.cellType == null &&
      this.rangeOf == null &&
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
    const meScalar = this.type != null;
    const theyScalar = this.type != null;

    if (meScalar && theyScalar) {
      const matchingTypes = this.type === other.type;
      const matchingUnits = matchUnitArrays(this.unit ?? [], other.unit ?? []);

      if (matchingTypes && matchingUnits) {
        return this;
      } else {
        return this.withErrorCause(
          !matchingTypes
            ? `Expected ${this.type}`
            : `Mismatched units: ${stringifyUnits(
                this.unit
              )} and ${stringifyUnits(other.unit)}`
        );
      }
    } else if (!meScalar && !theyScalar) {
      return this;
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
  reduced() {
    if (this.cellType != null) {
      return this.cellType;
    } else {
      return this.withErrorCause('Expected column');
    }
  }

  @propagate
  getRangeOf() {
    return this.rangeOf ?? this.withErrorCause('Expected range');
  }

  @propagate
  withColumnSize(columnSize: number | null) {
    if (this.columnSize === columnSize) {
      return this;
    } else {
      return this.withErrorCause(
        `Incompatible column sizes: ${this.columnSize} and ${columnSize}`
      );
    }
  }

  @propagate
  sameColumnessAs(other: Type) {
    return this.withColumnSize(other.columnSize).mapType((t) => {
      if (t.columnSize) {
        // Recurse to make sure it's a colummn of the same size
        return t
          .reduced()
          .sameAs(other.reduced())
          .mapType(() => t);
      } else {
        return t;
      }
    });
  }

  @propagate
  isRange() {
    if (this.rangeOf != null) {
      return this;
    } else {
      return this.withErrorCause('Expected range');
    }
  }

  @propagate
  sameRangenessAs(other: Type): Type {
    if (this.rangeOf != null && other.rangeOf != null) {
      return this.rangeOf.sameAs(other.rangeOf).mapType(() => this);
    } else if (this.rangeOf == null && other.rangeOf == null) {
      return this;
    } else {
      const errorMessage =
        this.rangeOf != null ? 'Expected range' : 'Unexpected range';

      return this.withErrorCause(errorMessage);
    }
  }

  @propagate
  isDate(specificity?: TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong): Type {
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
  isTimeQuantity() {
    if (this.timeUnits != null) {
      return this;
    } else {
      return this.withErrorCause('Expected time quantity');
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
