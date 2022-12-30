import { Result } from '@decipad/computer';
import { simpleFormatUnit } from '@decipad/format';
import { from as toFraction } from '@decipad/fraction';
import { coerceToDate } from './inferDate';

const textifyBoolean = (result: Result.Result<'boolean'>) =>
  result.value ? 'true' : 'false';

const textifyDate = (result: Result.Result<'date'>) =>
  coerceToDate(new Date(Number(result.value)), result.type.date);

const textifyNumber = (result: Result.Result<'number'>) =>
  `(${toFraction(result.value).toFraction()}) ${
    result.type.unit ? simpleFormatUnit(result.type.unit) : ''
  }`;

export const textify = (result: Result.Result): string => {
  switch (result.type.kind) {
    case 'boolean':
      return textifyBoolean(result as Result.Result<'boolean'>);
    case 'date':
      return textifyDate(result as Result.Result<'date'>);
    case 'number':
      return textifyNumber(result as Result.Result<'number'>);
    case 'string':
      return JSON.stringify(result.value);
    default:
      throw new Error(`cannot textify ${result.type.kind}`);
  }
};
