import type { Time } from '@decipad/remote-computer';
import { formatDate } from '@decipad/utils';
import { parseDate } from './parseDate';
import { CoercibleType, DateGranularity } from './types';

const defaultFormatForSpecificity = (s: Time.Specificity) => {
  switch (s) {
    case 'year':
      return 'yyyy';
    case 'quarter':
      return "yyyy'Q'q";
    case 'month':
      return 'yyyy-MM';
    case 'day':
      return 'yyyy-MM-dd';
    case 'hour':
      return 'yyyy-MM-dd HH';
    case 'minute':
      return 'yyyy-MM-dd HH:mm';
    default:
      return 'yyyy-MM-dd HH:mm:ss';
  }
};

export const coerceToDate = (
  d: bigint,
  specificity: Time.Specificity
): string => {
  return `date(${formatDate(d, defaultFormatForSpecificity(specificity))})`;
};

export const inferDate = (
  text: string,
  granularity?: DateGranularity,
  allowedFormats?: string[]
): CoercibleType | undefined => {
  if (!text.trim()) {
    return {
      type: {
        kind: 'date',
        date: 'day',
      },
    };
  }
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
