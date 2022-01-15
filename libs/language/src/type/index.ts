import { immerable, produce } from 'immer';
import Fraction from '@decipad/fraction';
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
  reducedToLowest,
  sameAs,
  sameUnitsAs,
  withColumnSize,
  withMinimumColumnCount,
  withAtParentIndex,
} from './checks';
import { InferError } from './InferError';
import {
  inverseExponent,
  normalizeUnits,
  setUnit,
  stringifyUnits,
} from './units';
import { Unit, Units, units } from './unit-type';

export type { Unit, Units };

export * from './serialization';
export { setUnit, stringifyUnits, normalizeUnits, units };
export { InferError, inverseExponent, t as build };

export const scalarTypeNames = ['number', 'string', 'boolean'];

export type TypeName = typeof scalarTypeNames[number];

type CombineArg = Type | ((t: Type) => Type);

export class Type {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: string | null = null;
  unit: Units | null = null;

  date: Time.Specificity | null = null;

  rangeOf: Type | null = null;

  // Indices (columns, tables, imported tables)
  indexName: string | null = null;
  indexedBy: string | null = null;

  // Column
  cellType: Type | null = null;
  columnSize: number | 'unknown' | null = null;
  atParentIndex: number | null = null;

  // Table
  tableLength: number | 'unknown' | null = null;
  columnTypes: Type[] | null = null;
  columnNames: string[] | null = null;

  rowCellTypes: Type[] | null = null;
  rowCellNames: string[] | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;

  // Return the first type that has an error, or the last one.
  static combine(initialType: Type, ...types: CombineArg[]): Type {
    let lastNonErrorType = initialType;
    if (lastNonErrorType.errorCause != null) {
      return lastNonErrorType;
    }
    for (const type of types) {
      const resultingType =
        typeof type === 'function' ? lastNonErrorType.mapType(type) : type;
      if (resultingType.errorCause != null) {
        return resultingType;
      }
      lastNonErrorType = resultingType;
    }

    return lastNonErrorType;
  }

  /** Return the first non-error type */
  static either(...types: Type[]): Type {
    const notErrored = types.find((t) => !t.errorCause);
    return notErrored ?? types[0];
  }

  toString(value?: Fraction): string {
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
    if (this.isTimeQuantity().errorCause == null) return 'time quantity';
    if (this.date != null) return `date(${this.date})`;
    if (this.rangeOf != null) return 'range';
    if (this.columnSize != null) return 'column';
    if (this.columnTypes != null) return 'table';
    if (this.rowCellTypes != null) return 'row';

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
    const { node, errorCause } = this;

    if (errorCause) {
      return this;
    } else {
      return t.impossible(error, node);
    }
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

  reducedToLowest(): Type {
    return reducedToLowest(this);
  }

  withColumnSize(columnSize: number | 'unknown' | null): Type {
    return withColumnSize(this, columnSize);
  }

  withAtParentIndex(parentIndex?: number): Type {
    return withAtParentIndex(this, parentIndex);
  }

  withMinimumColumnCount(columnSize: number | 'unknown' | null): Type {
    return withMinimumColumnCount(this, columnSize);
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

  multiplyUnit(withUnits: Units | null): Type {
    return multiplyUnit(this, withUnits);
  }

  divideUnit(divideBy: Units | number | null): Type {
    return divideUnit(this, divideBy);
  }
}
