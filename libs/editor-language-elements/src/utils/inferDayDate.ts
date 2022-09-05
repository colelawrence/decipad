import { CoercibleType } from '../types';
import {
  coerceToDate,
  dateGranularityFromString,
  formatToGranularity,
  parseDate,
} from './inferDate';

const dayOrMonthFormatToGranularity = Object.fromEntries(
  Object.entries(formatToGranularity).filter(
    ([, granularity]) => granularity === 'day' || granularity === 'month'
  )
);

export const inferDayDate = (text: string): CoercibleType | undefined => {
  if (parseDate(text, dayOrMonthFormatToGranularity) != null) {
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
