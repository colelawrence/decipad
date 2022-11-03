import { Type } from '..';
import type { Interpreter } from '../interpreter';
import { SerializedType, SerializedTypeKind, serializeType } from '../type';
import { UnknownValue } from '../value';
import { validateResult } from './validate';

export { validateResult } from './validate';

type OneResult = Interpreter.OneResult;
export type { OneResult };

export { UnknownValue };

// Can be used as Result to represent the entire spectrum of possible result values and types or
// Result<'number'> to represent a specific kind of result value and type.
export interface Result<T extends SerializedTypeKind = SerializedTypeKind> {
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
    : T extends 'table'
    ? Interpreter.ResultTable
    : T extends 'row'
    ? Interpreter.ResultRow
    : T extends 'function'
    ? Interpreter.ResultUnknown | null
    : T extends 'type-error'
    ? Interpreter.ResultUnknown | null
    : never;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
}

export * from './resultToValue';
export * as ResultTransforms from './ResultTransforms';
export { Column } from './Column';
export type { ColumnLike, Comparable } from './Column';

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  value: Interpreter.OneResult | null | undefined
): Result<T> {
  validateResult(type, value);
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
  } as Result<T>;
}
