import type { SerializedType, SerializedTypeKind } from './SerializedTypes';
import type { Value } from '.';
import type { DeciNumberBase } from '@decipad/number';

export type GenericResultGenerator<T> = (
  start?: number,
  end?: number
) => AsyncGenerator<T>;

export interface ResultGenerator {
  (start?: number, end?: number): AsyncGenerator<OneResult>;
  WASM_ID?: string;
  WASM_REALM_ID?: 'compute-backend';

  cellCount?: number;
}

export type ResultNumber = DeciNumberBase;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint | undefined;
export type ResultRange = [ResultNumber, ResultNumber] | [bigint, bigint];
export type ResultColumn = ResultGenerator;
export type ResultMaterializedColumn = OneResult[];
export type ResultRow = OneResult[];
export type ResultTable = Array<ResultColumn>;
export type ResultMetric = [
  ResultColumn | ResultMaterializedColumn,
  ResultColumn | ResultMaterializedColumn
];
export type ResultTree = Value.Tree;
export type ResultMaterializedTable = ResultMaterializedColumn[];
export type ResultUnknown = symbol;
export type ResultFunction = Value.FunctionValue;
export type ResultTrend = Value.TrendValue;

// trees
export type ResultTreeGroup = {
  root: OneResult;
  children: ResultTreeGroup[];
};

export type OneMaterializedResult =
  | ResultNumber
  | ResultString
  | ResultBoolean
  | ResultDate
  | ResultRange
  | ResultMaterializedColumn
  | ResultRow
  | ResultMaterializedTable
  | ResultUnknown
  | ResultFunction
  | ResultTrend
  | ResultMetric;

export type OneResult =
  | ResultNumber
  | ResultString
  | ResultBoolean
  | ResultDate
  | ResultRange
  | ResultColumn
  | ResultMaterializedColumn
  | ResultRow
  | ResultTable
  | ResultTree
  | ResultMaterializedTable
  | ResultUnknown
  | ResultFunction
  | ResultTrend
  | ResultMetric;

export interface ResultMetadataColumn {
  labels?: Promise<Array<Array<string>>> | undefined;
}

export type ResultMetadata<T extends SerializedTypeKind = SerializedTypeKind> =
  T extends 'materialized-column' | 'column' | 'materialized-table' | 'table'
    ? ResultMetadataColumn
    : undefined;

// Can be used as Result to represent the entire spectrum of possible result values and types or
// Result<'number'> to represent a specific kind of result value and type.
export type Result<T extends SerializedTypeKind = SerializedTypeKind> = {
  value: T extends 'number'
    ? ResultNumber
    : T extends 'boolean'
    ? ResultBoolean
    : T extends 'string'
    ? ResultString
    : T extends 'date'
    ? ResultDate
    : T extends 'range'
    ? ResultRange
    : T extends 'column'
    ? ResultColumn
    : T extends 'materialized-column'
    ? ResultMaterializedColumn
    : T extends 'table'
    ? ResultTable
    : T extends 'metric'
    ? ResultMetric
    : T extends 'materialized-table'
    ? ResultMaterializedTable
    : T extends 'row'
    ? ResultRow
    : T extends 'tree'
    ? ResultTree
    : T extends 'trend'
    ? ResultTrend
    : T extends 'function'
    ? ResultFunction
    : T extends 'type-error'
    ? ResultUnknown | null
    : T extends 'pending'
    ? ResultUnknown
    : never;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
  meta?: undefined | (() => ResultMetadata<T>);
};

export type AnyResult = Result<SerializedTypeKind>;
