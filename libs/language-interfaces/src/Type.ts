// eslint-disable-next-line no-restricted-imports
import type { immerable } from 'immer';
import type { Unit } from './Unit';
import type { AST, IInferError, Time } from '.';
import type { PromiseOrType } from '@decipad/utils';

export type PrimitiveTypeName = 'number' | 'string' | 'boolean';

export interface Type {
  [immerable]: boolean;
  node: AST.Node | null;
  errorCause: IInferError | null;

  type: PrimitiveTypeName | null;
  unit: Unit[] | null;
  numberFormat: AST.NumberFormat | null;
  numberError: 'month-day-conversion' | null;

  date: Time.Specificity | null;

  rangeOf: Type | null;

  // Indices (columns, tables, imported tables)
  indexName: string | null;
  indexedBy: string | null;

  // Column
  cellType: Type | null;
  cellCount?: number;
  atParentIndex: number | null;

  // Table
  columnTypes: Type[] | null;
  columnNames: string[] | null;
  rowCount?: number;
  delegatesIndexTo?: string | null;

  rowIndexName: string | null;
  rowCellTypes: Type[] | null;
  rowCellNames: string[] | null;

  // Functions are impossible types with functionness = true
  functionness: boolean;
  functionName: string | undefined;
  functionArgNames: string[] | undefined;
  functionBody: AST.Block | undefined;
  functionScopeDepth: number | undefined;

  tree: Type[] | undefined;

  trendOf: Type | undefined;

  // Set to true when the type is still pending inference
  pending: boolean;

  // Set to true when no data will be present. Used for empty blocks
  nothingness: boolean;

  // Set to true when it can be anything. Used for narrowing when you don't care about the insides of composite types
  anythingness: boolean;

  // Associates the type to a symbol
  symbol: string | null;

  mapType(fn: (t: Type) => PromiseOrType<Type>): Promise<Type>;

  inNode(node: AST.Node): Type;
  withErrorCause(error: IInferError | string): Type;
  expected(expected: Type | string): Promise<Type>;

  // Type assertions -- these return a new type possibly with an error
  sameAs(other: Type | Promise<Type>): Promise<Type>;

  isNothing(): Promise<Type>;
  isScalar(type: PrimitiveTypeName): Promise<Type>;
  isColumn(): Promise<Type>;
  isTree(): Promise<Type>;
  isTrend(): Promise<Type>;
  isFunction(): Promise<Type>;
  isTable(): Promise<Type>;
  isTableOrRow(): Promise<Type>;
  reduced(): Promise<Type>;
  reducedToLowest(): Promise<Type>;
  withAtParentIndex(): Promise<Type>;
  withMinimumColumnCount(colCount?: number): Promise<Type>;
  isPrimitive(): Promise<Type>;
  isRange(): Promise<Type>;
  getRangeOf(): Promise<Type>;
  isTimeQuantity(): Promise<Type>;
  isDate(specificity?: Time.Specificity): Promise<Type>;
  multiplyUnit(withUnits: Unit[] | null): Promise<Type>;
  divideUnit(divideBy: Unit[] | number | null): Promise<Type>;
  sharePercentage(other: Type): Promise<Type>;
}
