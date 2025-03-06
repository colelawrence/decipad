import stringify from 'json-stringify-safe';
import type { Result, SerializedType } from '@decipad/language-interfaces';
import { coerceToDate } from './inferDate';
import { simpleFormatUnit } from '@decipad/format';

const labelizeBoolean = (value: Result.Result<'boolean'>['value']): string =>
  value ? 'true' : 'false';

const labelizeDate = (
  value: Result.Result<'date'>['value'],
  type: Result.Result<'date'>['type']
): string => {
  const res = value != null ? coerceToDate(value, type.date) : 'date()';
  if (typeof res === 'string' && res.startsWith('date(') && res.endsWith(')')) {
    return res.slice(5, -1);
  }
  return res;
};

const ONE_BILLION = 1000000000;
const ONE_MILLION = 1000000;
const ONE_THOUSAND = 1000;

const labelizeNumber = (
  value: Result.Result<'number'>['value'],
  type: Result.Result<'number'>['type']
) => {
  let f = stringify(Number(value));

  if (Math.abs(Number(value)) >= 1000) {
    const absValue = Math.abs(Number(value));
    if (absValue >= ONE_BILLION) {
      f = `${(Number(value) / ONE_BILLION).toFixed(1)}B`;
    } else if (absValue >= ONE_MILLION) {
      f = `${(Number(value) / ONE_MILLION).toFixed(1)}M`;
    } else {
      f = `${(Number(value) / ONE_THOUSAND).toFixed(1)}k`;
    }
  }
  if (type.unit) {
    f = `${f} ${simpleFormatUnit(type.unit)}`;
  }
  return f;
};

export const labelize = (
  value: Result.OneResult,
  type: SerializedType
): string => {
  if (typeof value === 'symbol') {
    return '?';
  }
  try {
    switch (type.kind) {
      case 'boolean':
        return labelizeBoolean(value as Result.Result<'boolean'>['value']);
      case 'date':
        return labelizeDate(value as Result.Result<'date'>['value'], type);
      case 'number':
        return labelizeNumber(value as Result.Result<'number'>['value'], type);
      case 'string':
        return stringify(value);
      default:
        return `<${type.kind}>`;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error labelizing', value, type);
    // eslint-disable-next-line no-console
    console.error(err);
    return '<error>';
  }
};
