import { SeriesType } from '@decipad/editor-types';
import { Time } from '@decipad/computer';
import { add as addDate, Duration, format as formatDate } from 'date-fns';
import { parseDate } from './parseDate';

const dateGranularityToDateFnsDuration: Record<Time.Specificity, Duration> = {
  year: { years: 1 },
  month: { months: 1 },
  day: { days: 1 },
  hour: { hours: 1 },
  minute: { minutes: 1 },
  second: { seconds: 1 },
  millisecond: { seconds: 0.001 },
};

export const dateIterator = (
  granularity: Time.Specificity,
  initialValue: string
): Iterator<string> => {
  const parseResult = parseDate(initialValue, granularity);
  if (!parseResult) {
    throw new Error(`Could not parse date ${initialValue}`);
  }
  const { format } = parseResult;
  let v: Date = parseResult.date;
  const g = dateGranularityToDateFnsDuration[granularity];
  return {
    next() {
      v = addDate(v, g);
      return {
        value: formatDate(v, format),
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
