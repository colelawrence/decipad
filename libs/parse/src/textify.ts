import stringify from 'json-stringify-safe';
import type { Result, SerializedType } from '@decipad/remote-computer';
import { simpleFormatUnit } from '@decipad/format';
import { N } from '@decipad/number';
import { coerceToDate } from './inferDate';

const textifyBoolean = (value: Result.Result<'boolean'>['value']): string =>
  value ? 'true' : 'false';

const textifyDate = (
  value: Result.Result<'date'>['value'],
  type: Result.Result<'date'>['type']
): string => {
  const res = value != null ? coerceToDate(value, type.date) : 'date()';
  return res;
};

const textifyNumber = (
  value: Result.Result<'number'>['value'],
  type: Result.Result<'number'>['type']
) => {
  let f = N(value).toFraction();
  if (!/^-?[0-9.]+$/.test(f)) {
    f = `(${f})`;
  }
  if (type.unit) {
    f = `${f} ${simpleFormatUnit(type.unit)}`;
  }
  return f;
};

export const textify = (
  value: Result.OneResult,
  type: SerializedType
): string => {
  if (typeof value === 'symbol') {
    return '?';
  }
  try {
    switch (type.kind) {
      case 'boolean':
        return textifyBoolean(value as Result.Result<'boolean'>['value']);
      case 'date':
        return textifyDate(value as Result.Result<'date'>['value'], type);
      case 'number':
        return textifyNumber(value as Result.Result<'number'>['value'], type);
      case 'string':
        return stringify(value);
      default:
        return `<${type.kind}>`;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error textifying', value, type);
    // eslint-disable-next-line no-console
    console.error(err);
    return '<error>';
  }
};
