import { immerable, produce } from 'immer';
import { Time } from '..';
import * as AST from '../parser/ast-types';
import { zip } from '../utils';
import * as t from './build';
import {
  divideUnit,
  getRangeOf,
  isColumn,
  isDate,
  isRange,
  isScalar,
  isTable,
  isTableOrRow,
  isTimeQuantity,
  multiplyUnit,
  noUnitsOrSameUnitsAs,
  reduced,
  reducedOrSelf,
  sameAs,
  sameUnitsAs,
  withColumnSize,
} from './checks';
import { InferError } from './InferError';
import {
  inverseExponent,
  normalizeUnits,
  setUnit,
  stringifyUnits,
} from './units';

export * from './serialization';
export { setUnit, stringifyUnits, normalizeUnits };
export { InferError, inverseExponent, t as build };

export const scalarTypeNames = ['number', 'string', 'boolean'];

export type TypeName = typeof scalarTypeNames[number];

export class Type {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: string | null = null;
  unit: AST.Units | null = null;

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

  toString(value?: number): string {
    if (this.errorCause != null) {
      return `Error: ${this.errorCause.message}`;
    }

    if (this.columnSize != null && this.cellType != null) {
      return `${this.cellType.toString(value)} x ${this.columnSize}`;
    }

    if (this.columnTypes != null && this.columnNames != null) {
      const columnStrings = zip(this.columnNames, this.columnTypes).map(
        ([name, cell]) => `${name} = ${cell.toString()}`
      );

      return `table (${this.tableLength}) { ${columnStrings.join(', ')} }`;
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

    if (this.unit != null && this.unit.args.length > 0) {
      return stringifyUnits(this.unit, value);
    }

    if (this.date != null) {
      return this.date;
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

    /* istanbul ignore next */
    throw new Error('toBasicString: unknown type');
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
    if (typeof error === 'string') {
      return this.withErrorCause(new InferError(error));
    }
    return this.mapType(() => {
      return produce(this, (newType) => {
        newType.type = null;
        newType.unit = null;
        newType.errorCause = error;
      });
    });
  }

  expected(expected: Type | string): Type {
    return this.mapType(() =>
      this.withErrorCause(InferError.expectedButGot(expected, this))
    );
  }

  // Type assertions -- these return a new type possibly with an error
  sameAs(other: Type): Type {
    return sameAs(this, other);
  }

  isScalar(type: TypeName): Type {
    return isScalar(this, type);
  }

  sameUnitsAs(other: Type): Type {
    return sameUnitsAs(this, other);
  }

  noUnitsOrSameUnitsAs(other: Type): Type {
    return noUnitsOrSameUnitsAs(this, other);
  }

  isColumn(size?: number | 'unknown'): Type {
    return isColumn(this, size);
  }

  isTable(): Type {
    return isTable(this);
  }

  isTableOrRow(): Type {
    return isTableOrRow(this);
  }

  reduced(): Type {
    return reduced(this);
  }

  reducedOrSelf(): Type {
    return reducedOrSelf(this);
  }

  withColumnSize(columnSize: number | 'unknown' | null): Type {
    return withColumnSize(this, columnSize);
  }

  isRange(): Type {
    return isRange(this);
  }

  getRangeOf(): Type {
    return getRangeOf(this);
  }

  isTimeQuantity(): Type {
    return isTimeQuantity(this);
  }

  isDate(specificity?: Time.Specificity): Type {
    return isDate(this, specificity);
  }

  multiplyUnit(withUnits: AST.Units | null): Type {
    return multiplyUnit(this, withUnits);
  }

  divideUnit(divideBy: AST.Units | number | null): Type {
    return divideUnit(this, divideBy);
  }
}
