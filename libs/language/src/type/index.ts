import { immerable, produce } from 'immer';

import { Time } from '..';
import { zip } from '../utils';
import * as AST from '../parser/ast-types';
import { InferError } from './InferError';
import {
  inverseExponent,
  combineUnits,
  removeSingleUnitless,
  matchUnitArrays,
  stringifyUnits,
  multiplyExponent,
} from './units';
import { setUnit } from './utils';

import * as t from './build';

export * from './serialization';
export { InferError, inverseExponent, t as build };

export const scalarTypeNames = ['number', 'string', 'boolean'];

export type TypeName = typeof scalarTypeNames[number];

// wraps a method propagating errors found in `this` or any argument.
const propagate = <P extends Array<unknown>>(
  method: (this: Type, ...params: P) => Type
): ((this: Type, ...params: P) => Type) => {
  return function propagated(...args) {
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

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: string | null = null;
  unit: AST.Unit[] | null = null;

  date: Time.Specificity | null = null;

  rangeOf: Type | null = null;

  // Indices (columns, tables, imported tables)
  indexName: string | null = null;
  indexedBy: string | null = null;

  // Column
  cellType: Type | null = null;
  columnSize: number | 'unknown' | null = null;

  // Table
  tableLength: number | 'unknown' | null = null;
  columnTypes: Type[] | null = null;
  columnNames: string[] | null = null;

  rowCellTypes: Type[] | null = null;
  rowCellNames: string[] | null = null;

  // Time quantities
  timeUnits: Time.Unit[] | null = null;

  // Imported data
  dataUrl: string | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;

  // Return the first type that has an error, or the last one.
  static combine(...types: Type[]): Type {
    for (let i = 0; i < types.length; i++) {
      if (types[i].errorCause != null || i === types.length - 1) {
        return types[i];
      }
    }

    throw new Error('panic: Type.combine() called with 0 arguments');
  }

  toString(): string {
    if (this.errorCause != null) {
      return `Error: ${this.errorCause.message}`;
    }

    if (this.columnSize != null && this.cellType != null) {
      return `${this.cellType.toString()} x ${this.columnSize}`;
    }

    if (this.columnTypes != null && this.columnNames != null) {
      const columnStrings = zip(this.columnNames, this.columnTypes).map(
        ([name, cell]) => `${name} = ${cell.toString()}`
      );

      return `table { ${columnStrings.join(', ')} }`;
    }

    if (this.rowCellTypes != null && this.rowCellNames != null) {
      const rowCellStrings = zip(this.rowCellNames, this.rowCellTypes).map(
        ([name, cell]) => `${name} = ${cell.toString()}`
      );

      return `row [ ${rowCellStrings.join(', ')} ]`;
    }

    if (this.rangeOf != null) {
      return `range of ${this.rangeOf.toString()}`;
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
    if (this.columnTypes != null) return 'table';
    if (this.rowCellTypes != null) return 'row';
    if (this.timeUnits != null) return `time quantity`;
    if (this.dataUrl != null) return 'imported data';

    /* istanbul ignore next */
    throw new Error('toBasicString: unknown type');
  }

  get cardinality(): number {
    if (this.columnTypes != null) {
      return 2 + Math.max(...this.columnTypes.map((c) => c.cardinality));
    } else if (this.rowCellTypes != null) {
      return 1 + Math.max(...this.rowCellTypes.map((c) => c.cardinality));
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
    return propagate(function propagated(
      this: Type,
      error: InferError | string
    ) {
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
    return propagate(function propagated(this: Type, expected: Type | string) {
      return this.withErrorCause(InferError.expectedButGot(expected, this));
    }).call(this, expected);
  }

  // Type assertions -- these return a new type possibly with an error
  sameAs(other: Type): Type {
    return propagate(function propagated(this: Type, other: Type) {
      return this.sameScalarnessAs(other)
        .sameColumnessAs(other)
        .sameDatenessAs(other)
        .sameRangenessAs(other);
    }).call(this, other);
  }

  isScalar(type: TypeName): Type {
    return propagate(function propagated(this: Type, type: TypeName) {
      if (type === this.type) {
        return this;
      } else {
        return this.expected(t.scalar(type));
      }
    }).call(this, type);
  }

  sameUnitsAs(other: Type): Type {
    if (!matchUnitArrays(this.unit ?? [], other.unit ?? [])) {
      return this.withErrorCause(
        InferError.expectedUnit(other.unit, this.unit)
      );
    }
    return this;
  }

  noUnitsOrSameUnitsAs(other: Type): Type {
    return !this.unit ? this : this.sameUnitsAs(other);
  }

  sameScalarnessAs(other: Type): Type {
    return propagate(function propagated(this: Type, other: Type) {
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
          return setUnit(this, onlyOneHasAUnit);
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

  isColumn(size?: number | 'unknown'): Type {
    return propagate(function propagated(
      this: Type,
      size?: number | 'unknown'
    ) {
      if (
        (size === undefined && this.columnSize != null) ||
        this.columnSize === size ||
        this.columnSize === 'unknown' ||
        size === 'unknown'
      ) {
        return this;
      } else {
        return this.withErrorCause(
          `Incompatible column sizes: ${this.columnSize} and ${size ?? 'any'}`
        );
      }
    }).call(this, size);
  }

  isTable(): Type {
    return propagate(function propagated(this: Type) {
      if (this.columnNames != null && this.columnTypes != null) {
        return this;
      } else {
        return this.expected('table');
      }
    }).call(this);
  }

  reduced(): Type {
    return propagate(function propagated(this: Type) {
      if (this.cellType != null) {
        return this.cellType;
      } else {
        return this.expected('column');
      }
    }).call(this);
  }

  reducedOrSelf(): Type {
    return propagate(function propagated(this: Type) {
      if (this.cellType != null) {
        return this.cellType;
      } else {
        return this;
      }
    }).call(this);
  }

  withColumnSize(columnSize: number | 'unknown' | null): Type {
    return propagate(function propagated(
      this: Type,
      columnSize: number | 'unknown' | null
    ) {
      if (
        this.columnSize === columnSize ||
        this.columnSize === 'unknown' ||
        columnSize === 'unknown'
      ) {
        return this;
      } else {
        return this.withErrorCause(
          `Incompatible column sizes: ${this.columnSize} and ${columnSize}`
        );
      }
    }).call(this, columnSize);
  }

  sameColumnessAs(other: Type): Type {
    return propagate(function propagated(this: Type, other: Type) {
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
    return propagate(function propagated(this: Type) {
      if (this.rangeOf != null) {
        return this;
      } else {
        return this.expected('range');
      }
    }).call(this);
  }

  getRangeOf(): Type {
    return propagate(function propagated(this: Type) {
      return this.rangeOf ?? this.expected('range');
    }).call(this);
  }

  sameRangenessAs(other: Type): Type {
    return propagate(function propagated(this: Type, other: Type) {
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
    return propagate(function propagated(this: Type) {
      if (this.timeUnits != null) {
        return this;
      } else {
        return this.expected('time quantity');
      }
    }).call(this);
  }

  isDate(specificity?: TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong): Type {
    return propagate(function propagated(
      this: Type,
      specificity?: TimeDotSpecificityBecauseNextJsIsVeryBadAndWrong
    ) {
      if (
        this.date != null &&
        (specificity == null || this.date === specificity)
      ) {
        return this;
      } else {
        return this.expected(specificity ? t.date(specificity) : 'date');
      }
    }).call(this, specificity);
  }

  sameDatenessAs(other: Type): Type {
    return propagate(function propagated(this: Type, other: Type) {
      if (this.date === other.date) {
        return this;
      } else {
        return this.expected(other);
      }
    }).call(this, other);
  }

  multiplyUnit(withUnits: AST.Unit[] | null): Type {
    return propagate(function propagated(
      this: Type,
      withUnits: AST.Unit[] | null
    ) {
      return setUnit(this, combineUnits(this.unit, withUnits));
    }).call(this, withUnits);
  }

  divideUnit(divideBy: AST.Unit[] | number | null): Type {
    return propagate(function propagated(
      this: Type,
      divideBy: AST.Unit[] | number | null
    ) {
      if (typeof divideBy === 'number') {
        const multiplyBy = 1 / divideBy;
        if (this.unit) {
          return setUnit(this, multiplyExponent(this.unit, multiplyBy));
        }
        return this;
      } else {
        const invTheirUnits =
          divideBy == null ? null : divideBy.map((u) => inverseExponent(u));

        return setUnit(this, combineUnits(this.unit, invTheirUnits));
      }
    }).call(this, divideBy);
  }
}
