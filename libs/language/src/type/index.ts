import { immerable, produce } from 'immer';
import { Time } from '..';
import * as AST from '../parser/ast-types';
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
  reduced,
  reducedToLowest,
  sameAs,
  withColumnSize,
  withMinimumColumnCount,
  withAtParentIndex,
  isPrimitive,
  canAddTableColumn,
  sharePercentage,
} from './checks';
import { InferError, ErrSpec } from './InferError';
import {
  inverseExponent,
  normalizeUnits,
  normalizeUnitsOf,
  setUnit,
  simplifyUnits,
  pluralizeUnit,
} from './units';
import { Unit, Units, units, FUnit, FUnits, TUnit, TUnits } from './unit-type';

export { simplifyUnits, pluralizeUnit };

export type { ErrSpec, Unit, Units, FUnit, FUnits, TUnit, TUnits };

export * from './serialization';
export * from './convert-to-multiplier-unit';
export { setUnit, normalizeUnits, normalizeUnitsOf, units };
export { InferError, inverseExponent, t as build };
export { parseType, parseFunctionSignature } from './parseType';
export type { FunctionSignature } from './narrowing';
export { narrowTypes, narrowFunctionCall } from './narrowing';

export type PrimitiveTypeName = 'number' | 'string' | 'boolean';

type CombineArg = Type | ((t: Type) => Type);

export class Type {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: PrimitiveTypeName | null = null;
  unit: Units | null = null;
  numberFormat: AST.NumberFormat | null = null;

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
  functionName: string | undefined;
  functionArgCount: number | undefined;

  // Set to true when no data will be present. Used for empty blocks
  nothingness = false;

  // Set to true when it can be anything. Used for narrowing when you don't care about the insides of composite types
  anythingness = false;

  // Associates the type to a symbol
  symbol: string | null = null;

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

  isScalar(type: PrimitiveTypeName): Type {
    return isScalar(this, type);
  }

  isColumn(size?: number | 'unknown'): Type {
    return isColumn(this, size);
  }

  isTable(): Type {
    return isTable(this);
  }

  canAddTableColumn(colName: string): Type {
    return canAddTableColumn(this, colName);
  }

  isTableOrRow(): Type {
    return isTableOrRow(this);
  }

  reduced(): Type {
    return reduced(this);
  }

  reducedToLowest(): Type {
    return reducedToLowest(this);
  }

  withColumnSize(columnSize: number | 'unknown' | null): Type {
    return withColumnSize(this, columnSize);
  }

  withAtParentIndex(): Type {
    return withAtParentIndex(this);
  }

  withMinimumColumnCount(columnSize = 1): Type {
    return withMinimumColumnCount(this, columnSize);
  }

  isPrimitive(): Type {
    return isPrimitive(this);
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

  sharePercentage(other: Type) {
    return sharePercentage(this, other);
  }
}
