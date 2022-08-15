import { getDefined } from '@decipad/utils';
import { parse } from 'date-fns';

type DateGranularity =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';

const granularityRank = new Map(
  Object.entries({
    year: 1,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 6,
  })
) as Map<DateGranularity, number>;

const formatToGranularity: Record<string, DateGranularity> = {
  yyyy: 'year',
  'yyyy/MM': 'month',
  P: 'day',
  'dd/MM/yyyy': 'day',
  PP: 'day',
  Pp: 'minute',
  PPpp: 'second',
};

function isValidDate(d: Date | undefined): d is Date {
  return d != null && !Number.isNaN(d.valueOf());
}

export function parseDate(value: string): number | undefined {
  const formats = ['yyyy', 'yyyy/MM', 'P', 'dd/MM/yyyy', 'PP', 'Pp', 'PPpp'];
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
  return 'second'; // what?
}

export function highestDateGranularity(
  ...gs: DateGranularity[]
): DateGranularity | undefined {
  let highestG: DateGranularity | undefined;
  let highestGRank = -1;
  for (const g of gs) {
    const thisRank = granularityRank.get(g);
    if (thisRank && thisRank > highestGRank) {
      highestGRank = thisRank;
      highestG = g;
    }
  }
  return highestG;
}
