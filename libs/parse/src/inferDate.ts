import { format as formatDate, isValid } from 'date-fns';
import { Time } from '@decipad/computer';
import { parseDate } from './parseDate';
import { CoercibleType, DateGranularity } from './types';

export const coerceToDate = (
  d: Date,
  specificity: Time.Specificity
): string => {
  if (!isValid(d)) {
    throw new Error('invalid date');
  }
  switch (specificity) {
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

export const inferDate = (
  text: string,
  granularity?: DateGranularity,
  allowedFormats?: string[]
): CoercibleType | undefined => {
  const parsed = parseDate(text, granularity, allowedFormats);
  if (parsed) {
    return {
      type: {
        kind: 'date',
        date: parsed.specificity,
      },
      coerced: coerceToDate(parsed.date, parsed.specificity),
    };
  }
  return undefined;
};
