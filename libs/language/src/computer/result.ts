import {
  SerializedType,
  SerializedTypeKind,
  serializeType,
} from '../type/serialization';
import { Interpreter } from '../interpreter';
import { Type } from '..';
import { OneResult } from '../interpreter/interpreter-types';

// Can be used as Result to represent the entire spectrum of possible result values and types or
// Result<'number'> to represent a specific kind of result value and type.
export interface Result<T extends SerializedTypeKind = SerializedTypeKind> {
  value: T extends 'column'
    ? Interpreter.ResultColumn
    : T extends 'date'
    ? Interpreter.ResultDate
    : T extends 'number'
    ? Interpreter.ResultNumber
    : T extends 'range'
    ? Interpreter.ResultRange
    : T extends 'scalar'
    ? Interpreter.ResultScalar
    : T extends 'table'
    ? Interpreter.ResultTable
    : T extends 'time-quantity'
    ? Interpreter.ResultTimeQuantity
    : T extends 'type-error'
    ? null
    : Interpreter.OneResult;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
}

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  value: OneResult | null
): Result<T> {
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
  } as Result<T>;
}
