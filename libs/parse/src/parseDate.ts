import { Time } from '@decipad/computer';
import { parse } from 'date-fns';
import { DateFormat } from './types';

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
) as Map<Time.Specificity, number>;

export const highestTimeSpecificity = (
  ...gs: Time.Specificity[]
): Time.Specificity | undefined => {
  let highestG: Time.Specificity | undefined;
  let highestGRank = -1;
  for (const g of gs) {
    const thisRank = granularityRank.get(g);
    if (thisRank && thisRank > highestGRank) {
      highestGRank = thisRank;
      highestG = g;
    }
  }
  return highestG;
};

const isValidDate = (d: Date | undefined): d is Date => {
  return d != null && !Number.isNaN(d.valueOf());
};

const combineFormats = (a: string[], b: string[]): string[] => {
  const formats: string[] = [];
  for (const aElem of a) {
    for (const bElem of b) {
      formats.push(`${aElem} ${bElem}`);
    }
  }
  return formats;
};

// Format strings reference:
// https://date-fns.org/v2.25.0/docs/format
const dayFormats = [
  'dd-MM-yyyy',
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'yyyy/MM/dd',
  'P',
  'PP',
  'PPP',
];
const minuteFormats = ['HH:mm', 'HHmm', 'h:m aaa', 'hh:mm aaa', 'hhmm aaa'];
const secondFormats = ['s', 'ss'];
const fractionSecondsFormats = ['S', 'SS', 'SSS', 'SSSS'];
export const dateFormats: Record<Time.Specificity, DateFormat[]> = {
  year: ['yy', 'yyyy'],
  month: [
    'yyyy-MM',
    'MM-yyyy',
    'yyyy/MM',
    'MM/yyyy',
    'MMM yyyy',
    'MMMM yyyy',
    'MMM/yyyy',
    'MMMM/yyyy',
    'MMM-yyyy',
    'MMMM-yyyy',
  ],
  day: dayFormats,
  hour: combineFormats(dayFormats, ['HH']),
  minute: combineFormats(dayFormats, minuteFormats),
  second: combineFormats(
    combineFormats(dayFormats, minuteFormats),
    secondFormats
  ),
  millisecond: combineFormats(
    combineFormats(combineFormats(dayFormats, minuteFormats), secondFormats),
    fractionSecondsFormats
  ),
};

const dateFormatsForSpecificity = (
  specificity: Time.Specificity
): Record<Time.Specificity, string[]> => {
  return Object.fromEntries(
    Object.entries(dateFormats).filter(([s]) => specificity === s)
  ) as Record<Time.Specificity, DateFormat[]>;
};

interface ParseDateResult {
  format: string;
  specificity: Time.Specificity;
  date: Date;
}

export const parseDate = (
  value: string,
  specificity?: Time.Specificity,
  allowedFormats?: string[]
): ParseDateResult | undefined => {
  const formats =
    allowedFormats && specificity
      ? {
          [specificity]: allowedFormats,
        }
      : specificity
      ? dateFormatsForSpecificity(specificity)
      : dateFormats;
  for (const spec of Object.keys(formats) as Array<Time.Specificity>) {
    const formatStrings = formats[spec];
    for (const format of formatStrings) {
      const date = parse(value, format, new Date());
      if (isValidDate(date)) {
        return {
          format,
          specificity: spec,
          date,
        };
      }
    }
  }
  return undefined;
};
