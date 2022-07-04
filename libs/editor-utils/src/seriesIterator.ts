import { SeriesType } from '@decipad/editor-types';
import { Time } from '@decipad/computer';
import {
  add as addDate,
  parse as parseDate,
  Duration,
  format as formatDate,
  isValid as isValidDate,
} from 'date-fns';
import { dateFormats } from '@decipad/editor-utils';

const referenceDate = new Date();

const dateGranularityToDateFnsDuration: Record<Time.Specificity, Duration> = {
  year: { years: 1 },
  month: { months: 1 },
  day: { days: 1 },
  hour: { hours: 1 },
  minute: { minutes: 1 },
  second: { seconds: 1 },
  millisecond: { seconds: 0.001 },
};

const tryParseDate = (
  text: string,
  formats: string[]
): [Date, string] | undefined => {
  for (const format of formats) {
    try {
      const d = parseDate(text, format, referenceDate);
      if (isValidDate(d)) {
        return [d, format];
      }
    } catch (err) {
      // do nothing
    }
  }
  return undefined;
};

const stringifyDate = (d: Date, format: string): string => {
  return formatDate(d, format);
};

export const dateIterator = (
  granularity: Time.Specificity,
  initialValue: string
): Iterator<string> => {
  const formats = dateFormats[granularity];
  const parseResult = tryParseDate(initialValue, formats);
  if (!parseResult) {
    throw new Error(`Could not parse date ${initialValue}`);
  }
  let v = parseResult[0];
  const format = parseResult[1];
  const g = dateGranularityToDateFnsDuration[granularity];
  return {
    next() {
      v = addDate(v, g);
      return {
        value: stringifyDate(v, format),
      };
    },
  };
};

export const seriesIterator = (
  type: SeriesType,
  granularity: Time.Specificity,
  initialValue: string
): Iterator<string> => {
  if (granularity == null) {
    throw new Error('Date series requires granularity');
  }
  switch (type) {
    case 'date':
      return dateIterator(granularity, initialValue);
  }
};
