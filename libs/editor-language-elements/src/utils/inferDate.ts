import { getDefined } from '@decipad/utils';
import { format as formatDate, parse } from 'date-fns';
import { CoercibleType } from '../types';

type DateGranularity =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';

const formatToGranularity: Record<string, DateGranularity> = {
  yyyy: 'year',
  'yyyy/MM': 'month',
  'yyyy-MM': 'month',
  'yyyy-MM-dd': 'day',
  'dd/MM/yyyy': 'day',
  P: 'day',
  PP: 'day',
  'yyyy-MM-dd HH': 'hour',
  'yyyy-MM-dd HH:mm': 'minute',
  Pp: 'minute',
  'yyyy-MM-dd HH:mm:ss': 'second',
  PPpp: 'second',
};

function isValidDate(d: Date | undefined): d is Date {
  return d != null && !Number.isNaN(d.valueOf());
}

export function parseDate(value: string): number | undefined {
  const formats = Object.keys(formatToGranularity);
  let d: Date | undefined;
  do {
    const format = getDefined(formats.shift());
    d = parse(value, format, new Date());
  } while (formats.length > 0 && !isValidDate(d));
  return isValidDate(d) ? d.getTime() : undefined;
}

export function dateGranularityFromString(value: string): DateGranularity {
  for (const [format, granularity] of Object.entries(formatToGranularity)) {
    const d = parse(value, format, new Date());
    if (isValidDate(d)) {
      return granularity;
    }
  }
  throw new Error(`panic: unknown granularity for ${value}`);
}

const coerceToDate = (text: string): string => {
  const d = parseDate(text);
  if (d == null) {
    throw new Error(`don't know how to coerce "${text}" to a date`);
  }
  const granularity = dateGranularityFromString(text);
  switch (granularity) {
    case 'year':
      return `date(${formatDate(d, 'yyyy')})`;
    case 'month':
      return `date(${formatDate(d, 'yyyy-MM')})`;
    case 'day':
      return `date(${formatDate(d, 'yyyy-MM-dd')})`;
    case 'hour':
      return `date(${formatDate(d, 'yyyy-MM-dd HH')})`;
    case 'minute':
      return `date(${formatDate(d, 'yyyy-MM-dd HH:mm')})`;
    default:
      return `date(${formatDate(d, 'yyyy-MM-dd HH:mm:ss')})`;
  }
};

export const inferDate = (text: string): CoercibleType | undefined => {
  if (parseDate(text) != null) {
    return {
      type: {
        kind: 'date',
        date: dateGranularityFromString(text),
      },
      coerced: coerceToDate(text),
    };
  }
  return undefined;
};
