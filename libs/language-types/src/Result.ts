import DeciNumber from '@decipad/number';
import { SerializedType, SerializedTypeKind } from './SerializedType';
import { Value } from '.';

export type ResultGenerator = (
  start?: number,
  end?: number
) => AsyncGenerator<OneResult>;

export type ResultNumber = DeciNumber;
export type ResultString = string;
export type ResultBoolean = boolean;
export type ResultDate = bigint | undefined;
export type ResultRange = [ResultNumber, ResultNumber] | [bigint, bigint];
export type ResultColumn = ResultGenerator;
export type ResultMaterializedColumn = OneResult[];
export type ResultRow = OneResult[];
export type ResultTable = Array<ResultColumn>;
export type ResultMaterializedTable = ResultMaterializedColumn[];
export type ResultUnknown = symbol;
export type ResultFunction = Value.FunctionValue;

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
  | ResultFunction;

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
  | ResultMaterializedTable
  | ResultUnknown
  | ResultFunction;

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
    : T extends 'materialized-table'
    ? ResultMaterializedTable
    : T extends 'row'
    ? ResultRow
    : T extends 'function'
    ? ResultFunction
    : T extends 'type-error'
    ? ResultUnknown | null
    : T extends 'pending'
    ? ResultUnknown
    : never;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
};

export type AnyResult = Result<SerializedTypeKind>;
