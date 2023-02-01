import { Result } from '@decipad/computer';
import { simpleFormatUnit } from '@decipad/format';
import { N } from '@decipad/number';
import { coerceToDate } from './inferDate';

const textifyBoolean = (result: Result.Result<'boolean'>) =>
  result.value ? 'true' : 'false';

const textifyDate = (result: Result.Result<'date'>) =>
  coerceToDate(new Date(Number(result.value)), result.type.date);

const textifyNumber = (result: Result.Result<'number'>) => {
  let f = N(result.value).toFraction();
  if (!/^-?[0-9.]+$/.test(f)) {
    f = `(${f})`;
  }
  if (result.type.unit) {
    f = `${f} ${simpleFormatUnit(result.type.unit)}`;
  }
  return f;
};

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
