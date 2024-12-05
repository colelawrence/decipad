import type { Unit as TUnit, AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Time } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { n, pairwise } from '@decipad/language-utils';
import { getDefined } from '@decipad/utils';
import { DateTime } from 'luxon';

export { Time };

const specificities: Time.Specificity[] = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
];

export const getJSDateUnitAndMultiplier = (unit: Time.TimeUnit) =>
  Time.timeUnitToJSDateUnit[unit];

export const jsUnitToIndex: Record<Time.JSDateUnit, number> = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5,
  millisecond: 6,
};

export const jsIndexToUnit: Record<number, Time.JSDateUnit> = {
  0: 'year',
  1: 'month',
  2: 'day',
  3: 'hour',
  4: 'minute',
  5: 'second',
  6: 'millisecond',
};

const timeUnitToIndex: Record<Time.TimeUnit, number> = {
  undefined: -1,
  millennium: 0,
  century: 1,
  decade: 2,
  year: 3,
  quarter: 4,
  month: 5,
  week: 6,
  day: 7,
  hour: 8,
  minute: 9,
  second: 10,
  millisecond: 11,
};

export const sortTimeUnits = <T extends string | TUnit>(
  toSort: Iterable<T>
): T[] => {
  const uniqueUnits = Array.from(new Set(toSort));
  return uniqueUnits.sort((a: TUnit | string, b: TUnit | string) => {
    const tua = Time.timeUnitFromUnit(a);
    const tub = Time.timeUnitFromUnit(b);
    return Math.sign(timeUnitToIndex[tua] - timeUnitToIndex[tub]);
  });
};

const cmpJSDateUnits = (left: Time.JSDateUnit, right: Time.JSDateUnit) => {
  const leftIdx = jsUnitToIndex[left];
  const rightIdx = jsUnitToIndex[right];

  return Math.sign(leftIdx - rightIdx);
};

export function getUTCDateSpecificity(iso: string): Time.Specificity {
  const segmentCount = getDefined(iso.match(/(\d+)/g)?.length);

  return specificities[segmentCount - 1] as Time.Specificity;
}

export function date(
  parsableDate: string,
  specificity: Time.JSDateUnit
): AST.Date {
  const dateArray = Time.dateToArray(Time.parseUTCDate(parsableDate));

  const args: AST.Date['args'] = [];

  for (const [unit, index] of Object.entries(jsUnitToIndex)) {
    args.push(unit as Time.JSDateUnit, BigInt(dateArray[index]));

    if (cmpJSDateUnits(unit as Time.JSDateUnit, specificity) === 0) {
      break;
    }
  }

  return n('date', ...args);
}

export const dateNodeToSpecificity = (
  nodeArgs: AST.Date['args']
): Time.Specificity => Time.getSpecificity(dateNodeToTimeUnit(nodeArgs));

export const dateNodeToTimeUnit = (
  nodeArgs: AST.Date['args']
): Time.TimeUnit => {
  let lowestSegment: Time.TimeUnit = 'undefined';

  for (const [segment] of pairwise<Time.TimeUnit, unknown>(nodeArgs)) {
    lowestSegment = segment;
  }

  return lowestSegment;
};

const getDateFromAstFormQuarter = (
  segments: AST.Date['args']
): [bigint | undefined, Time.Specificity] => {
  const quarter = (Number(segments[3]) - 1) * 3 + 1;
  const [dateNum] = getDateFromAstForm([
    'year',
    segments[1],
    'month',
    BigInt(quarter),
  ]);
  return [dateNum, 'quarter'];
};

const getDateFromAstFormWeek = (
  segments: AST.Date['args']
): [bigint | undefined, Time.Specificity] => {
  const year = Number(segments[1]);
  const week = Number(segments[3]);
  const dateNum = BigInt(
    DateTime.fromObject(
      { weekYear: year, weekNumber: week },
      { zone: 'utc' }
    ).toMillis()
  );
  return [dateNum, 'week'];
};

export const getDateFromAstForm = (
  segments: AST.Date['args']
): [bigint | undefined, Time.Specificity] => {
  const secondSegment = segments[2];
  switch (secondSegment) {
    case 'quarter':
      return getDateFromAstFormQuarter(segments);
    case 'week':
      return getDateFromAstFormWeek(segments);
    default: {
      const dateNum = Time.arrayToDate([
        segments[1],
        segments[3],
        segments[5],
        segments[7],
        segments[9],
        segments[11],
      ]);
      return [dateNum, dateNodeToSpecificity(segments)];
    }
  }
};
