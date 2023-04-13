import { Time } from '@decipad/computer';
import { parse } from 'date-fns';
import { once } from 'ramda';
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

const combineFormats = (
  a: string[],
  b: string[],
  separators: string | string[] = [' ']
): string[] => {
  const formats: string[] = [];
  const sep = Array.isArray(separators) ? separators : [separators];
  for (const aElem of a) {
    for (const bElem of b) {
      for (const s of sep) {
        formats.push(`${aElem}${s}${bElem}`);
      }
    }
  }
  return formats;
};

const timeZoneFormats = ['', 'X', 'XX', 'XXX', 'XXXX', 'XXXXX'];

const combineWithAndWithoutTimezone = (formats: string[]) =>
  combineFormats(formats, timeZoneFormats, '');

// Format strings reference:
// https://date-fns.org/v2.25.0/docs/format
export const dateFormats = once((): Record<Time.Specificity, DateFormat[]> => {
  const dayFormats = [
    'MM/dd/yyyy',
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
  return {
    year: ['yy', 'yyyy'],
    quarter: ["yyyy'q'q", "yyyy'Q'q", "yyyy'q'qq", "yyyy'Q'qq"],
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
    hour: combineWithAndWithoutTimezone(
      combineFormats(dayFormats, ['HH'], [' ', "'T'"])
    ),
    minute: combineWithAndWithoutTimezone(
      combineFormats(dayFormats, minuteFormats, [' ', "'T'"])
    ),
    second: combineWithAndWithoutTimezone(
      combineFormats(
        combineFormats(dayFormats, minuteFormats, [' ', "'T'"]),
        secondFormats,
        [' ', ':']
      )
    ),
    millisecond: combineWithAndWithoutTimezone(
      combineFormats(
        combineFormats(
          combineFormats(dayFormats, minuteFormats),
          secondFormats
        ),
        fractionSecondsFormats
      )
    ),
  };
});

const dateFormatsForSpecificity = (
  specificity: Time.Specificity
): Partial<Record<Time.Specificity, string[]>> => ({
  [specificity]: dateFormats()[specificity],
});

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
      : dateFormats();
  const now = new Date();
  for (const spec of Object.keys(formats) as Array<Time.Specificity>) {
    const formatStrings = formats[spec] ?? [];
    for (const format of formatStrings) {
      const date = parse(value, format, now);
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
