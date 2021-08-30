import { parseISO } from 'date-fns';

type DateGranularity = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

export function parseDate(value: string): number | null {
  const d = parseISO(value);
  if (Number.isNaN(d.valueOf())) {
    return null;
  }
  return d.getTime();
}

export function dateGranularityFromString(value: string): DateGranularity {
  switch (value.length) {
    case 4:
      return 'year'; // 2020
    case 7:
      return 'month'; // 2020-07
    case 10:
      return 'day'; // 2020-07-21
    case 13:
      return 'hour'; // 2020-07-21T04
    case 16:
      return 'minute'; // 2020-07-21T04:35
    default:
      return 'second'; // 2020-07-21T04:35:59
  }
}
