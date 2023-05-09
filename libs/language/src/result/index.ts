import { Type } from '..';
import type { Interpreter } from '../interpreter';
import { SerializedType, SerializedTypeKind, serializeType } from '../type';
import { UnknownValue, Unknown } from '../value';
import { validateResult } from '../validateResult';

type OneResult = Interpreter.OneResult;
export type { OneResult };

export { UnknownValue, Unknown };

// Can be used as Result to represent the entire spectrum of possible result values and types or
// Result<'number'> to represent a specific kind of result value and type.
export type Result<T extends SerializedTypeKind = SerializedTypeKind> = {
  value: T extends 'number'
    ? Interpreter.ResultNumber
    : T extends 'boolean'
    ? Interpreter.ResultBoolean
    : T extends 'string'
    ? Interpreter.ResultString
    : T extends 'date'
    ? Interpreter.ResultDate
    : T extends 'range'
    ? Interpreter.ResultRange
    : T extends 'column'
    ? Interpreter.ResultColumn
    : T extends 'materialized-column'
    ? Interpreter.ResultMaterializedColumn
    : T extends 'table'
    ? Interpreter.ResultTable
    : T extends 'materialized-table'
    ? Interpreter.ResultMaterializedTable
    : T extends 'row'
    ? Interpreter.ResultRow
    : T extends 'function'
    ? Interpreter.ResultUnknown | null
    : T extends 'type-error'
    ? Interpreter.ResultUnknown | null
    : T extends 'pending'
    ? Interpreter.ResultUnknown
    : never;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
};

export type AnyResult = Result<SerializedTypeKind>;

export * from './resultToValue';
export { Column } from './Column';
export type { ColumnLikeResult, Comparable } from './Column';

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  _value: Interpreter.OneResult | null | undefined
): Result<T> {
  const value = validateResult(type, _value);
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
  } as Result<T>;
}
