// eslint-disable-next-line import/no-duplicates
import differenceInMonths from 'date-fns/differenceInMonths';
// eslint-disable-next-line import/no-duplicates
import differenceInYears from 'date-fns/differenceInYears';

import { singular } from 'pluralize';
import Fraction from '@decipad/fraction';
import { AST, Unit } from '..';
import { n, pairwise, getDefined } from '../utils';
import { Date as LanguageDate } from '../interpreter/Value';
import * as Time from './time-types';

export * from './time-quantities';
export { TimeQuantity } from './TimeQuantity';
export { Time };

/*
 * Check out ./interfaces.ts for documentation about different kinds of time units
 */
/* Warning: extremely hacky
 *
 * There was an initial version of this code which used date-fns, however its
 * UTC support leaves a lot to be desired. They're working on a new date-fns/utc
 * which I think we should adopt as soon as it comes out
 *
 * For now, here's some nonsense about turning dates into arrays and back:
 */

const specificities: Time.Specificity[] = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
];

export const timeUnitToJSDateUnit: Record<
  Time.Unit,
  [Time.JSDateUnit, bigint]
> = {
  millennium: ['year', 1000n],
  century: ['year', 100n],
  decade: ['year', 10n],
  year: ['year', 1n],
  quarter: ['month', 3n],
  month: ['month', 1n],
  week: ['day', 7n],
  day: ['day', 1n],
  hour: ['hour', 1n],
  minute: ['minute', 1n],
  second: ['second', 1n],
  millisecond: ['millisecond', 1n],
};

const timeUnits = new Set(Object.keys(timeUnitToJSDateUnit));

export const getJSDateUnitAndMultiplier = (unit: Time.Unit) =>
  timeUnitToJSDateUnit[unit];

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

const timeUnitToIndex: Record<Time.Unit, number> = {
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

// fixme: this doesnt seem to be used. dead code?
export const timeIndexToUnit: Record<number, Time.Unit> = {
  0: 'millennium',
  1: 'century',
  2: 'decade',
  3: 'year',
  4: 'quarter',
  5: 'month',
  6: 'week',
  7: 'day',
  8: 'hour',
  9: 'minute',
  10: 'second',
  11: 'millisecond',
};

export const timeUnitToNormalMax: Record<Time.Unit, number> = {
  millennium: Infinity,
  century: Infinity,
  decade: Infinity,
  year: Infinity,
  quarter: 3,
  month: 11,
  week: Infinity,
  day: Infinity,
  hour: 24,
  minute: 59,
  second: 59,
  millisecond: 999,
};

// Deal with annoying intersections
type AnyUnit = Time.Unit | Time.Specificity | Time.JSDateUnit;

export const timeUnitFromUnit = (unit: Unit | string): Time.Unit => {
  const u = singular((unit as Unit).unit ?? unit);
  if (!timeUnits.has(u)) {
    throw new Error(`Expected time unit and got ${u}`);
  }
  return u as Time.Unit;
};

export const getSpecificity = (thing?: string | Unit): Time.Specificity => {
  let unit = typeof thing === 'string' ? thing : thing && thing.unit;
  if (unit) {
    unit = singular(unit);

    if (unit === 'millennium') return 'year';
    if (unit === 'century') return 'year';
    if (unit === 'decade') return 'year';

    if (unit === 'quarter') return 'month';

    if (unit === 'week') return 'day';

    if (specificities.includes(unit as Time.Specificity)) {
      return unit as Time.Specificity;
    }
  }

  throw new Error(`panic: Expected Time.JSDateUnit, got ${unit}`);
};

export const getJSDateUnit = (thing: AnyUnit) => {
  if (thing in timeUnitToJSDateUnit) {
    // Eliminate quarter, week
    [thing] = timeUnitToJSDateUnit[thing as Time.Unit];
  }

  if (thing in jsUnitToIndex) {
    return thing as Time.JSDateUnit;
  }

  throw new Error(`panic: Expected Time.JSDateUnit, got ${thing}`);
};

export const getTimeUnit = (thing: string) => {
  if (thing in timeUnitToJSDateUnit) {
    return thing as Time.Unit;
  } else {
    throw new Error(`panic: Expected Time.Unit, got ${thing}`);
  }
};

export const cmpSpecificities = (left: string, right: string): number => {
  const leftIdx = specificities.indexOf(getSpecificity(left));
  const rightIdx = specificities.indexOf(getSpecificity(right));

  return Math.sign(leftIdx - rightIdx);
};

export const sortSpecificities = (specificities: (Unit | string)[]) => {
  const uniqueSpecificities = Array.from(
    new Set(specificities.map((s) => getSpecificity(s)))
  );
  return uniqueSpecificities.sort((a, b) => cmpSpecificities(a, b));
};

export const sortTimeUnits = <T extends string | Unit>(
  toSort: Iterable<T>
): T[] => {
  const uniqueUnits = Array.from(new Set(toSort));
  return uniqueUnits.sort((a, b) => {
    const tua = timeUnitFromUnit(a);
    const tub = timeUnitFromUnit(b);
    return Math.sign(timeUnitToIndex[tua] - timeUnitToIndex[tub]);
  });
};

export const getHighestSpecificity = (specificities: Unit[]) =>
  getDefined(sortSpecificities(specificities).pop());

const cmpJSDateUnits = (left: Time.JSDateUnit, right: Time.JSDateUnit) => {
  const leftIdx = jsUnitToIndex[left];
  const rightIdx = jsUnitToIndex[right];

  return Math.sign(leftIdx - rightIdx);
};

// Dates are ranges -- this function cuts up a date to its closest specificity
export const cleanDate = (
  date: bigint | number,
  specificity: Time.Specificity
): bigint => {
  const necessarySegments = dateToArray(date).slice(
    0,
    jsUnitToIndex[specificity] + 1
  );

  return arrayToDate(necessarySegments);
};

export const dateToArray = (date: Date | number | bigint) => {
  const d = typeof date === 'bigint' ? new Date(Number(date)) : new Date(date);

  return [
    BigInt(d.getUTCFullYear()),
    BigInt(d.getUTCMonth() + 1),
    BigInt(d.getUTCDate()),
    BigInt(d.getUTCHours()),
    BigInt(d.getUTCMinutes()),
    BigInt(d.getUTCSeconds()),
    BigInt(d.getUTCMilliseconds()),
  ];
};

const getDateSegment = (
  thing: bigint | string | AST.TZInfo | undefined,
  isMonth: boolean
): bigint | null => {
  if (typeof thing === 'string') {
    thing = BigInt(thing.replace(/^0+/, ''));
  }

  if (typeof thing === 'bigint') {
    return thing - (isMonth ? 1n : 0n);
  } else {
    return null;
  }
};

export function arrayToDate(
  segments: (string | bigint | AST.TZInfo | undefined)[]
): bigint {
  const nameAndNumber: [string, string | bigint | AST.TZInfo | undefined][] = [
    ['year', segments[0]],
    ['month', segments[1]],
    ['day', segments[2]],
    ['hour', segments[3]],
    ['minute', segments[4]],
    ['second', segments[5]],
    ['millisecond', segments[6]],
  ];

  const dateArgs: bigint[] = [];
  for (const [segName, segValue] of nameAndNumber) {
    const segNumber = getDateSegment(segValue, segName === 'month');

    if (segNumber != null) {
      dateArgs.push(segNumber);
    } else {
      break;
    }
  }

  const utcArgs = [
    Number(dateArgs[0]),
    Number(dateArgs[1] || 0n),
    ...dateArgs.slice(2).map(Number),
  ];
  const d = Date.UTC(utcArgs[0], utcArgs[1], ...utcArgs.slice(2));
  return BigInt(d);
}

// TODO move the following functions to test utils
export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g)?.map((n) => BigInt(n));

  return arrayToDate(getDefined(segments, `bad date ${iso}`));
}

export function getUTCDateSpecificity(iso: string): Time.Specificity {
  const segmentCount = getDefined(iso.match(/(\d+)/g)?.length);

  return specificities[segmentCount - 1] as Time.Specificity;
}

export function date(
  parsableDate: string,
  specificity: Time.JSDateUnit
): AST.Date {
  const dateArray = dateToArray(parseUTCDate(parsableDate));

  const args: AST.Date['args'] = [];

  for (const [unit, index] of Object.entries(jsUnitToIndex)) {
    args.push(unit as Time.JSDateUnit, BigInt(dateArray[index]));

    if (cmpJSDateUnits(unit as Time.JSDateUnit, specificity) === 0) {
      break;
    }
  }

  return n('date', ...args);
}

const pad = (x: bigint | string) => String(x).padStart(2, '0');

export function stringifyDate(
  date: bigint,
  specificity: Time.Specificity
): string {
  const segments = dateToArray(date);

  let out = String(segments[0]);
  if (specificity === 'year') return out;

  out += `-${pad(segments[1])}`;
  if (specificity === 'month') return out;

  out += `-${pad(segments[2])}`;
  if (specificity === 'day') return out;

  out += ` ${pad(segments[3])}:${pad(segments[4])}`;

  return out;
}

export const dateNodeToSpecificity = (
  nodeArgs: AST.Date['args']
): Time.Specificity => getSpecificity(dateNodeToTimeUnit(nodeArgs));

export const dateNodeToTimeUnit = (nodeArgs: AST.Date['args']): Time.Unit => {
  let lowestSegment: Time.Unit = 'year';

  for (const [segment] of pairwise<Time.Unit, unknown>(nodeArgs)) {
    lowestSegment = segment;
  }

  return lowestSegment;
};

export const getDateFromAstForm = (
  segments: AST.Date['args']
): [bigint, Time.Specificity] => {
  const dateNum = arrayToDate([
    segments[1],
    segments[3],
    segments[5],
    segments[7],
    segments[9],
    segments[11],
  ]);

  return [dateNum, dateNodeToSpecificity(segments)];
};

export const subtractDates = (
  d1: LanguageDate,
  d2: LanguageDate,
  specificity: Time.Specificity
): Fraction => {
  const ms1 = Number(d1.getData());
  const ms2 = Number(d2.getData());

  switch (specificity) {
    case 'year': {
      return new Fraction(differenceInYears(ms1, ms2) * 12);
    }
    case 'month': {
      return new Fraction(differenceInMonths(ms1, ms2));
    }
    default: {
      const msDifference = d1.getData() - d2.getData();

      return new Fraction(msDifference, 1000n);
    }
  }
};
