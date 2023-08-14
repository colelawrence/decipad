import type { Time } from '@decipad/computer';
import { Duration } from 'date-fns';
import { N, ONE } from '@decipad/number';
import { formatNumber } from '@decipad/format';
import { SeriesType } from '@decipad/editor-types';
import { DateTime } from 'luxon';
import { dateFromMillis, formatDate } from '@decipad/utils';
import { parseDate } from './parseDate';

const dateGranularityToDateFnsDuration: Record<Time.Specificity, Duration> = {
  undefined: {},
  year: { years: 1 },
  month: { months: 1 },
  quarter: { months: 3 },
  day: { days: 1 },
  hour: { hours: 1 },
  minute: { minutes: 1 },
  second: { seconds: 1 },
  millisecond: { seconds: 0.001 },
};

/**
 * Returns a date iterator from a string initial value .
 * The initial value should be a string that contains a parsable date (as defined in ./parseDate.ts)
 */
export const dateIterator = (
  granularity: Time.Specificity,
  initialValue: string
): Iterable<string> => {
  const parseResult = parseDate(initialValue, granularity);
  if (!parseResult) {
    throw new Error(`Could not parse date ${initialValue}`);
  }
  const { format } = parseResult;
  let v: DateTime = dateFromMillis(parseResult.date);
  const g = dateGranularityToDateFnsDuration[granularity];
  return {
    [Symbol.iterator]: () => {
      return {
        next() {
          v = v.plus(g);
          return { value: formatDate(BigInt(v.toMillis()), format) };
        },
      };
    },
  };
};

/**
 * Returns a number iterator from a string initial value .
 * The initial value should be a string that contains a parsable JS number
 */
export const numberIterator = (initialValue: string): Iterable<string> => {
  const parseResult = Number(initialValue);
  if (Number.isNaN(parseResult)) {
    throw new Error(`Could not parse number ${initialValue}`);
  }
  let v = N(parseResult);
  return {
    [Symbol.iterator]: () => {
      return {
        next() {
          v = v.add(ONE);
          return {
            value: formatNumber('en-US', null, v).asString,
          };
        },
      };
    },
  };
};

const internalSeriesIterator = (
  type: SeriesType,
  granularity: Time.Specificity | undefined,
  initialValue: string
): Iterable<string> => {
  switch (type) {
    case 'date':
      if (granularity == null) {
        throw new Error('Date series requires granularity');
      }
      return dateIterator(granularity, initialValue);
    case 'number':
      return numberIterator(initialValue);
  }
};

export const seriesIterator = (
  type: SeriesType,
  granularity: Time.Specificity | undefined,
  initialValue: string
): Iterable<string> => {
  try {
    return internalSeriesIterator(type, granularity, initialValue);
  } catch (err) {
    return [];
  }
};
