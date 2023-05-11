import { immerable } from 'immer';
import { PromiseOrType } from '@decipad/utils';
import type { AST, Time } from '..';
import * as t from './buildType';
import {
  divideUnit,
  getRangeOf,
  isColumn,
  isDate,
  isNothing,
  isPrimitive,
  isRange,
  isScalar,
  isTable,
  isTableOrRow,
  isTimeQuantity,
  multiplyUnit,
  reduced,
  reducedToLowest,
  sameAs,
  sharePercentage,
  withAtParentIndex,
  withMinimumColumnCount,
} from './checks';
import { InferError } from './InferError';
import type { Unit } from './unit-type';

export type PrimitiveTypeName = 'number' | 'string' | 'boolean';

type CombineArg = PromiseOrType<Type> | ((t: Type) => PromiseOrType<Type>);

export class Type {
  [immerable] = true;

  node: AST.Node | null = null;
  errorCause: InferError | null = null;

  type: PrimitiveTypeName | null = null;
  unit: Unit[] | null = null;
  numberFormat: AST.NumberFormat | null = null;
  numberError: 'month-day-conversion' | null = null;

  date: Time.Specificity | null = null;

  rangeOf: Type | null = null;

  // Indices (columns, tables, imported tables)
  indexName: string | null = null;
  indexedBy: string | null = null;

  // Column
  cellType: Type | null = null;
  atParentIndex: number | null = null;

  // Table
  columnTypes: Type[] | null = null;
  columnNames: string[] | null = null;

  rowIndexName: string | null = null;
  rowCellTypes: Type[] | null = null;
  rowCellNames: string[] | null = null;

  // Functions are impossible types with functionness = true
  functionness = false;
  functionName: string | undefined;
  functionArgCount: number | undefined;

  // Set to true when the type is still pending inference
  pending = false;

  // Set to true when no data will be present. Used for empty blocks
  nothingness = false;

  // Set to true when it can be anything. Used for narrowing when you don't care about the insides of composite types
  anythingness = false;

  // Associates the type to a symbol
  symbol: string | null = null;

  // Return the first type that has an error or is pending, or the last one.
  static async combine(
    initialType: Type | Promise<Type>,
    ...types: CombineArg[]
  ): Promise<Type> {
    let lastNonErrorType = await initialType;
    if (lastNonErrorType.errorCause != null || lastNonErrorType.pending) {
      return lastNonErrorType;
    }
    for await (const type of types) {
      const resultingType =
        typeof type === 'function'
          ? await lastNonErrorType.mapType(type)
          : type;
      if (resultingType.errorCause != null || resultingType.pending) {
        return resultingType;
      }
      lastNonErrorType = resultingType;
    }

    return lastNonErrorType;
  }

  /** Return the first non-error type */
  static async either(...types: Array<PromiseOrType<Type>>): Promise<Type> {
    const notErrored = (await Promise.all(types)).find((t) => !t.errorCause);
    return notErrored ?? types[0];
  }

  async mapType(fn: (t: Type) => PromiseOrType<Type>): Promise<Type> {
    if (this.errorCause) {
      return this;
    } else {
      return fn(this);
    }
  }

  inNode(node: AST.Node) {
    const t = new Type();
    Object.assign(t, this);
    t.node = node;
    return t;
  }

  withErrorCause(error: InferError | string): Type {
    const { node, errorCause } = this;

    if (errorCause) {
      return this;
    } else {
      return t.impossible(error, node);
    }
  }

  async expected(expected: Type | string): Promise<Type> {
    return this.mapType(() =>
      this.withErrorCause(InferError.expectedButGot(expected, this))
    );
  }

  // Type assertions -- these return a new type possibly with an error
  async sameAs(other: Type | Promise<Type>): Promise<Type> {
    return sameAs(this, other);
  }

  async isNothing(): Promise<Type> {
    return isNothing(this);
  }

  async isScalar(type: PrimitiveTypeName): Promise<Type> {
    return isScalar(this, type);
  }

  async isColumn(): Promise<Type> {
    return isColumn(this);
  }

  async isTable(): Promise<Type> {
    return isTable(this);
  }

  async isTableOrRow(): Promise<Type> {
    return isTableOrRow(this);
  }

  async reduced(): Promise<Type> {
    return reduced(this);
  }

  async reducedToLowest(): Promise<Type> {
    return reducedToLowest(this);
  }

  async withAtParentIndex(): Promise<Type> {
    return withAtParentIndex(this);
  }

  async withMinimumColumnCount(colCount = 1): Promise<Type> {
    return withMinimumColumnCount(this, colCount);
  }

  async isPrimitive(): Promise<Type> {
    return isPrimitive(this);
  }

  async isRange(): Promise<Type> {
    return isRange(this);
  }

  async getRangeOf(): Promise<Type> {
    return getRangeOf(this);
  }

  async isTimeQuantity(): Promise<Type> {
    return isTimeQuantity(this);
  }

  async isDate(specificity?: Time.Specificity): Promise<Type> {
    return isDate(this, specificity);
  }

  async multiplyUnit(withUnits: Unit[] | null): Promise<Type> {
    return multiplyUnit(this, withUnits);
  }

  async divideUnit(divideBy: Unit[] | number | null): Promise<Type> {
    return divideUnit(this, divideBy);
  }

  async sharePercentage(other: Type): Promise<Type> {
    return sharePercentage(this, other);
  }
}
