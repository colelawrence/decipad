import Fraction from '@decipad/fraction';
import { zip } from '@decipad/utils';
import { equalOrUnknown } from '../utils';
import { Type } from '..';
import { getSpecificity } from '../date';
import { Interpreter } from '../interpreter';
import { Unknown } from '../interpreter/Unknown';
import { SerializedType, SerializedTypeKind, serializeType } from '../type';
import { timeUnits } from '../type/units';

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
    : T extends 'time-quantity'
    ? Interpreter.ResultTimeQuantity
    : T extends 'function'
    ? Interpreter.ResultUnknown | null
    : T extends 'type-error'
    ? Interpreter.ResultUnknown | null
    : never;
  type: T extends SerializedTypeKind ? Extract<SerializedType, { kind: T }> : T;
}

export function serializeResult<T extends SerializedTypeKind>(
  type: Type,
  value: Interpreter.OneResult | null
): Result<T> {
  const serializedType = serializeType(type);
  return {
    value,
    type: serializedType,
  } as Result<T>;
}

export function validateResult(
  type: Type | SerializedType,
  value: Interpreter.OneResult | null
): boolean {
  if (type instanceof Type) {
    return validateResult(serializeType(type), value);
  }

  const reportError = () => {
    console.error('Failed to validate a Result:');
    console.error({ type, value });
  };
  const getTrue = (cond: boolean, failureMessage: string) => {
    if (cond) return true;
    reportError();
    throw new Error(failureMessage);
  };
  const getArray = <T>(thing: T) => {
    if (Array.isArray(thing)) return thing;
    reportError();
    throw new Error('panic: expected array');
  };
  const getOfKind = (type: SerializedType, ...kinds: SerializedTypeKind[]) => {
    if (kinds.includes(type.kind)) return type;
    reportError();
    throw new Error(`panic: wanted ${kinds.join('/')} and got ${type.kind}`);
  };

  switch (type.kind) {
    case 'number': {
      return getTrue(value instanceof Fraction, 'panic: expected bigint');
    }
    case 'boolean':
    case 'string': {
      return getTrue(
        typeof value === type.kind,
        `panic: expected ${type.kind}`
      );
    }
    case 'date': {
      return (
        getTrue(
          getSpecificity(type.date) === type.date,
          `invalid date specificity ${type.date}`
        ) &&
        getTrue(
          typeof value === 'bigint',
          'expected date to be represented as a bigint'
        )
      );
    }
    case 'range': {
      const values = getArray(value as Interpreter.ResultRange);

      getTrue(
        values.length === 2,
        'panic: expected range to be represented by an array of 2'
      );

      const rangeType = getOfKind(type.rangeOf, 'date', 'number');

      return (
        validateResult(rangeType, values[0]) &&
        validateResult(rangeType, values[1])
      );
    }
    case 'column': {
      const array = getArray(value as Interpreter.ResultColumn);
      equalOrUnknown(array.length, type.columnSize);
      return array.every((cell) => validateResult(type.cellType, cell));
    }
    case 'table': {
      return zip(
        type.columnTypes,
        getArray(value as Interpreter.ResultTable)
      ).every(([cellType, value]) => {
        const implicitColumn: SerializedType = {
          kind: 'column',
          cellType,
          columnSize: 'unknown',
          indexedBy: null,
        };
        return validateResult(implicitColumn, value);
      });
    }
    case 'row': {
      return zip(
        type.rowCellTypes,
        getArray(value as Interpreter.ResultRow)
      ).every(([type, value]) => validateResult(type, value));
    }
    case 'time-quantity': {
      return getArray(value as Interpreter.ResultTimeQuantity).every(
        ([timeUnit, howMuch]) =>
          timeUnits.has(timeUnit) && typeof howMuch === 'bigint'
      );
    }
    case 'function':
    case 'type-error': {
      return getTrue(value == null || value === Unknown, 'expected no value');
    }
  }
}
