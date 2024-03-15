import DeciNumber from '@decipad/number';
import { zip } from '@decipad/utils';
import { empty } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import {
  EMPTY,
  Result,
  SerializedType,
  SerializedTypeKind,
  Time,
  Type,
  Unknown,
  Value,
  serializeType,
} from '@decipad/language-types';
import { validateColumnResult } from './validateColumnResult';
import { Validate } from './types';

const getTrue = (cond: boolean, failureMessage: string) => {
  if (cond) return true;
  throw new Error(failureMessage);
};
const getArray = <T>(thing: T) => {
  if (Array.isArray(thing)) return thing;
  throw new Error('panic: expected array');
};
const getOfKind = (type: SerializedType, ...kinds: SerializedTypeKind[]) => {
  if (kinds.includes(type.kind)) return type;
  throw new Error(`panic: wanted ${kinds.join('/')} and got ${type.kind}`);
};

// eslint-disable-next-line complexity
const validate: Validate = <
  T extends Result.OneResult | null | undefined =
    | Result.OneResult
    | null
    | undefined
>(
  type: SerializedType,
  value: T
): Result.OneResult | null | undefined => {
  if (
    value == null ||
    typeof value === 'symbol' ||
    value === empty ||
    value === EMPTY
  ) {
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
        Time.getSpecificity(type.date) === type.date,
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
      const values = getArray(value as Result.ResultRange);

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
        value as Result.ResultGenerator | null,
        getTrue,
        validateResult
      ) as T;
    }
    case 'table': {
      const columnValues = getArray(value as Result.ResultTable);
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
      zip(type.rowCellTypes, getArray(value as Result.ResultRow)).forEach(
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
      getTrue(value instanceof Value.FunctionValue, 'expected no value');
      break;
    }
  }
  return value;
};

const reportError = (
  type: SerializedType,
  value: Result.OneResult | null | undefined,
  error?: Error
) => {
  console.error('Failed to validate a Result:', error?.message);
  console.error({ type, value });
};

export function validateResult(
  _type: Type | SerializedType,
  value: Result.OneResult | null | undefined
): Result.OneResult | null | undefined {
  let type: Type | SerializedType = _type;
  if (type instanceof Type) {
    type = serializeType(type);
  }

  try {
    return validate(type, value);
  } catch (e) {
    reportError(type, value, e as Error);
  }
  return undefined;
}
