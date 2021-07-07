import { immerable, produce } from 'immer';
import { getDefined } from '../utils';
import { InferError } from './InferError';
import {
  inverseExponent,
  combineUnits,
  removeSingleUnitless,
  matchUnitArrays,
  stringifyUnits,
} from './units';

export { InferError, inverseExponent };

export const scalarTypeNames = ['number', 'string', 'boolean'];

export type TypeName = typeof scalarTypeNames[number];

// wraps a method propagating errors found in `this` or any argument.
const propagate = <P extends Array<unknown>>(
  method: (this: Type, ...params: P) => Type
): ((this: Type, ...params: P) => Type) => {
  return function (...args) {
    /* istanbul ignore if */
    if (
      this.functionness ||
      args.some((a) => a instanceof Type && a.functionness)
    ) {
      throw new Error('panic: functions cannot be used');
    }

    const errored = [this, ...args].find(
      (a) => a instanceof Type && a.errorCause != null
    ) as Type | undefined;

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

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: string | null = null;
  unit: AST.Unit[] | null = null;

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

  // Imported data
  dataUrl: string | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;

  private constructor() {}

  static extend(
    base: Type,
    { type, unit, columnSize, date }: ExtendArgs
  ): Type {
    /* istanbul ignore if */
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

  static buildColumn(cellType: Type, columnSize: number | null) {
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
    if (types.length === 0) {
      return Type.Impossible.withErrorCause(InferError.unexpectedEmptyColumn());
    } else {
      const unified = types.reduce((a, b) => a.sameAs(b));

      if (unified.errorCause) {
        return Type.buildTuple(types);
      } else {
        return Type.buildListFromUnifiedType(unified, types.length);
      }
    }
  }

  static buildListFromUnifiedType(type: Type, length: number) {
    return Type.buildColumn(type, length);
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

  static buildImportedData(url: string) {
    const t = new Type();
    t.dataUrl = url;
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

    if (this.dataUrl != null) {
      return `<data url="${this.dataUrl}">`;
    }

    return `<${this.type}>`;
  }

  toBasicString() {
    if (this.functionness) return 'function';

    if (this.errorCause != null) {
      throw new Error('toBasicString: errors not supported');
    }

    if (this.unit != null) return stringifyUnits(this.unit);
    if (this.type != null) return this.type;
    if (this.date != null) return `date(${this.date})`;
    if (this.rangeOf != null) return 'range';
    if (this.columnSize != null) return 'column';
    if (this.tupleTypes != null) return 'table';
    if (this.timeUnits != null) return `time quantity`;
    if (this.dataUrl != null) return 'imported data';

    /* istanbul ignore next */
    throw new Error('toBasicString: unknown type');
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

  withErrorCause(error: InferError | string): Type {
    return propagate(function (this: Type, error: InferError | string) {
      if (typeof error === 'string') {
        return this.withErrorCause(new InferError(error));
      } else {
        return produce(this, (newType) => {
          newType.type = null;
          newType.unit = null;
          newType.errorCause = error;
        });
      }
    }).call(this, error);
  }

  expected(expected: Type | string): Type {
    return propagate(function (this: Type, expected: Type | string) {
      return this.withErrorCause(InferError.expectedButGot(expected, this));
    }).call(this, expected);
  }

  // Type assertions -- these return a new type possibly with an error
  sameAs(other: Type): Type {
    return propagate(function (this: Type, other: Type) {
      return this.sameScalarnessAs(other)
        .sameColumnessAs(other)
        .sameDatenessAs(other)
        .sameRangenessAs(other);
    }).call(this, other);
  }

  isScalar(type: TypeName): Type {
    return propagate(function (this: Type, type: TypeName) {
      if (type === this.type) {
        return this;
      } else {
        return this.expected(Type.buildScalar(type));
      }
    }).call(this, type);
  }

  sameScalarnessAs(other: Type): Type {
    return propagate(function (this: Type, other: Type) {
      const meScalar = this.type != null;
      const theyScalar = this.type != null;

      if (meScalar && theyScalar) {
        const matchingTypes = this.type === other.type;
        const matchingUnits = matchUnitArrays(
          this.unit ?? [],
          other.unit ?? []
        );
        const onlyOneHasAUnit = removeSingleUnitless(this, other);

        if (matchingTypes && matchingUnits) {
          return this;
        } else if (!matchingTypes) {
          return this.expected(other);
        } else if (onlyOneHasAUnit != null) {
          return Type.extend(this, {
            unit: onlyOneHasAUnit,
          });
        } else {
          return this.withErrorCause(
            InferError.expectedUnit(other.unit, this.unit)
          );
        }
      } else if (!meScalar && !theyScalar) {
        return this;
      } else {
        return this.expected(other);
      }
    }).call(this, other);
  }

  isColumn(size?: number): Type {
    return propagate(function (this: Type, size?: number) {
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
    }).call(this, size);
  }

  reduced(): Type {
    return propagate(function (this: Type) {
      if (this.cellType != null) {
        return this.cellType;
      } else {
        return this.expected('column');
      }
    }).call(this);
  }

  withColumnSize(columnSize: number | null): Type {
    return propagate(function (this: Type, columnSize: number | null) {
      if (this.columnSize === columnSize) {
        return this;
      } else {
        return this.withErrorCause(
          `Incompatible column sizes: ${this.columnSize} and ${columnSize}`
        );
      }
    }).call(this, columnSize);
  }

  sameColumnessAs(other: Type): Type {
    return propagate(function (this: Type, other: Type) {
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
    }).call(this, other);
  }

  isRange(): Type {
    return propagate(function (this: Type) {
      if (this.rangeOf != null) {
        return this;
      } else {
        return this.expected('range');
      }
    }).call(this);
  }

  getRangeOf(): Type {
    return propagate(function (this: Type) {
      return this.rangeOf ?? this.expected('range');
    }).call(this);
  }

  sameRangenessAs(other: Type): Type {
    return propagate(function (this: Type, other: Type) {
      if (this.rangeOf != null && other.rangeOf != null) {
        return this.rangeOf.sameAs(other.rangeOf).mapType(() => this);
      } else if (this.rangeOf == null && other.rangeOf == null) {
        return this;
      } else {
        return this.expected(other);
      }
    }).call(this, other);
  }

  isTimeQuantity(): Type {
    return propagate(function (this: Type) {
      if (this.timeUnits != null) {
        return this;
      } else {
        return this.expected('time quantity');
      }
    }).call(this);
  }

  isDate(specificity?: TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong): Type {
    return propagate(function (
      this: Type,
      specificity?: TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong
    ) {
      if (
        this.date != null &&
        (specificity == null || this.date === specificity)
      ) {
        return this;
      } else {
        return this.expected(
          specificity ? Type.buildDate(specificity) : 'date'
        );
      }
    }).call(this, specificity);
  }

  sameDatenessAs(other: Type): Type {
    return propagate(function (this: Type, other: Type) {
      if (this.date == other.date) {
        return this;
      } else {
        return this.expected(other);
      }
    }).call(this, other);
  }

  multiplyUnit(withUnits: AST.Unit[] | null): Type {
    return propagate(function (this: Type, withUnits: AST.Unit[] | null) {
      return Type.extend(this, { unit: combineUnits(this.unit, withUnits) });
    }).call(this, withUnits);
  }

  divideUnit(withUnits: AST.Unit[] | null): Type {
    return propagate(function (this: Type, withUnit: AST.Unit[] | null) {
      const theirUnits =
        withUnit == null ? null : withUnit.map((u) => inverseExponent(u));

      return Type.extend(this, { unit: combineUnits(this.unit, theirUnits) });
    }).call(this, withUnits);
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
