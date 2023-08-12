import DeciNumber from '@decipad/number';
import { zip } from '@decipad/utils';
import { Type } from '..';
import { getSpecificity } from '../date';
import { Interpreter } from '../interpreter';
import { Unknown } from '../value';
import { SerializedType, SerializedTypeKind, serializeType } from '../type';
import { validateColumnResult } from './validateColumnResult';
import { Validate } from './types';
import { ResultGenerator } from '../interpreter/interpreter-types';

const validate: Validate = <
  T extends Interpreter.OneResult | null | undefined =
    | Interpreter.OneResult
    | null
    | undefined
>(
  type: SerializedType,
  value: T
): Interpreter.OneResult | null | undefined => {
  const getTrue = (cond: boolean, failureMessage: string) => {
    if (cond) return true;
    reportError(type, value);
    throw new Error(failureMessage);
  };
  const getArray = <T>(thing: T) => {
    if (Array.isArray(thing)) return thing;
    reportError(type, value);
    throw new Error('panic: expected array');
  };
  const getOfKind = (type: SerializedType, ...kinds: SerializedTypeKind[]) => {
    if (kinds.includes(type.kind)) return type;
    reportError(type, value);
    throw new Error(`panic: wanted ${kinds.join('/')} and got ${type.kind}`);
  };

  if (value == null || typeof value === 'symbol') {
    return Unknown;
  }

  switch (type.kind) {
    case 'number': {
      getTrue(
        value instanceof DeciNumber,
        `panic: expected fraction and got ${typeof value}`
      );
      break;
    }
    case 'boolean': {
      getTrue(typeof value === 'boolean', 'panic: expected boolean');
      break;
    }
    case 'string': {
      getTrue(typeof value === 'string', 'panic: expected string');
      break;
    }
    case 'date': {
      getTrue(
        getSpecificity(type.date) === type.date,
        `invalid date specificity ${type.date}`
      );
      getTrue(
        typeof value === 'symbol' ||
          typeof value === 'bigint' ||
          value === undefined ||
          value instanceof DeciNumber,
        'expected date to be represented as a bigint or undefined'
      );
      break;
    }
    case 'range': {
      const values = getArray(value as Interpreter.ResultRange);

      getTrue(
        values.length === 2,
        'panic: expected range to be represented by an array of 2'
      );

      const rangeType = getOfKind(type.rangeOf, 'date', 'number');

      validate(rangeType, values[0]);
      validate(rangeType, values[1]);
      break;
    }
    case 'column':
    case 'materialized-column': {
      return validateColumnResult(
        type,
        value as ResultGenerator | null,
        getTrue,
        validate
      ) as T;
    }
    case 'table': {
      const columnValues = getArray(value as Interpreter.ResultTable);
      if (columnValues.length !== type.columnTypes.length) {
        console.log('columnValues', columnValues);
        throw new Error(
          `table has inconsistent number of columns: expected ${type.columnTypes.length} and has ${columnValues.length}`
        );
      }
      zip(type.columnTypes, columnValues).forEach(([cellType, value]) => {
        if (cellType) {
          const implicitColumn: SerializedType = {
            kind: 'column',
            cellType,
            indexedBy: null,
          };
          validate(implicitColumn, value);
        }
      });
      break;
    }
    case 'row': {
      zip(type.rowCellTypes, getArray(value as Interpreter.ResultRow)).forEach(
        ([type, value]) => validate(type, value)
      );
      break;
    }
    case 'pending': {
      getTrue(value === Unknown, 'expected Unknown');
      break;
    }
    case 'nothing': {
      getTrue(value == null || value === Unknown, 'expected no value');
      break;
    }
    case 'function': {
      getTrue(value == null || value === Unknown, 'expected no value');
      break;
    }
  }
  return value;
};

const reportError = (
  type: SerializedType,
  value: Interpreter.OneResult | null | undefined,
  error?: Error
) => {
  console.error('Failed to validate a Result:', error?.message);
  console.error({ type, value });
};

export function validateResult(
  type: Type | SerializedType,
  value: Interpreter.OneResult | null | undefined
) {
  if (type instanceof Type) {
    type = serializeType(type);
  }

  try {
    return validate(type, value);
  } catch (e) {
    reportError(type, value, e as Error);
    throw e;
  }
}
