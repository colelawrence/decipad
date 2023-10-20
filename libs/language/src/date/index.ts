import DeciNumber, { N, UNKNOWN_ASSTRING } from '@decipad/number';
import { DateTime } from 'luxon';
import { singular } from 'pluralize';
import { AST, Unit } from '..';
import { startOfDate } from '../../../utils/src/date';
import { getDefined, n, pairwise } from '../utils';
import { DateValue, Unknown } from '../value';
import * as Time from './time-types';

export * from './time-quantities';
export { Time };

/*
 * Check out ./time-types.ts for documentation about different kinds of time units
 */

/**
 * Create a Luxon DateTime without a timezone offset from a date-like arg
 */
export const toLuxonUTC = (date: bigint | number | DateTime) => {
  if (typeof date === 'bigint') {
    date = Number(date);
  }
  if (date instanceof DateTime) {
    return date.toUTC();
  }
  // if (date == null)
  if (typeof date !== 'number') {
    throw new Error(
      `panic: toLuxon(date) passed an invalid date: ${date} (${typeof date})`
    );
  }
  return DateTime.fromMillis(date).toUTC();
};

const allSpecificities = [
  'year',
  'quarter',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
];

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
  [Time.JSDateUnit, bigint] | undefined
> = {
  undefined,
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

const timeUnitToJSTimeIndex: Record<Time.Unit, number> = {
  undefined: -1,
  millennium: 0,
  century: 0,
  decade: 0,
  year: 0,
  quarter: 1,
  month: 1,
  week: 2,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5,
  millisecond: 6,
};

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
    if (unit === 'undefined') return 'undefined';
    if (unit === 'millennium') return 'year';
    if (unit === 'century') return 'year';
    if (unit === 'decade') return 'year';
    if (unit === 'week') return 'day';

    if (allSpecificities.includes(unit as Time.Specificity)) {
      return unit as Time.Specificity;
    }
  } else {
    return 'undefined';
  }

  throw new Error(`panic: Expected Time.JSDateUnit, got ${unit}`);
};

export const getTimeUnit = (thing: string): Time.Unit => {
  if (thing in timeUnitToJSDateUnit) {
    return thing as Time.Unit;
  } else {
    throw new Error(`panic: Expected Time.Unit, got ${thing}`);
  }
};

export const isTimeSpecificity = (thing: string): thing is Time.Specificity =>
  allSpecificities.includes(thing);

export const cmpSpecificities = (left: string, right: string): number => {
  const leftIdx = allSpecificities.indexOf(getSpecificity(left));
  const rightIdx = allSpecificities.indexOf(getSpecificity(right));

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
  date: bigint | number | undefined,
  specificity: Time.Specificity
): bigint | undefined => {
  if (date == null) {
    return undefined;
  }
  const necessarySegments = dateToArray(date).slice(
    0,
    timeUnitToJSTimeIndex[specificity] + 1
  );

  if (specificity === 'quarter') {
    // we must treat quarters specially because
    // they must end on the beginning of the first month
    // otherwise, comparisons with roundings will fail.
    return startOfDate(BigInt(date), specificity);
  }
  return arrayToDate(necessarySegments);
};

export const dateToArray = (
  date: Date | number | bigint | undefined
): Array<bigint> => {
  if (date == null || Number.isNaN(date)) {
    return [];
  }
  const d = new Date(Number(date));

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
): bigint | undefined {
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
  if (Number.isNaN(d)) return undefined;

  return BigInt(d);
}

// TODO move the following functions to test utils
export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g)?.map((n) => BigInt(n));

  return getDefined(arrayToDate(getDefined(segments, `bad date ${iso}`)));
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
  date: bigint | number | undefined | symbol,
  specificity: Time.Specificity
): string {
  if (date == null || typeof date === 'symbol' || Number.isNaN(date)) {
    return UNKNOWN_ASSTRING;
  }
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
  let lowestSegment: Time.Unit = 'undefined';

  for (const [segment] of pairwise<Time.Unit, unknown>(nodeArgs)) {
    lowestSegment = segment;
  }

  return lowestSegment;
};

export const getDateFromAstForm = (
  segments: AST.Date['args']
): [bigint | undefined, Time.Specificity] => {
  if (segments[2] === 'quarter') {
    const quarter = (Number(segments[3]) - 1) * 3 + 1;
    const [dateNum] = getDateFromAstForm([
      'year',
      segments[1],
      'month',
      BigInt(quarter),
    ]);
    return [dateNum, 'quarter'];
  }
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

export const subtractDates = async (
  d1: DateValue,
  d2: DateValue,
  specificity: Time.Specificity
): Promise<DeciNumber | typeof Unknown> => {
  const dd1 = await d1.getData();
  const dd2 = await d2.getData();
  if (dd1 == null || dd2 == null) {
    return Unknown;
  }
  const dateTime1 = await toLuxonUTC(dd1);
  const dateTime2 = await toLuxonUTC(dd2);

  switch (specificity) {
    case 'year': {
      return N(dateTime1.diff(dateTime2, 'years').years);
    }
    case 'month': {
      return N(dateTime1.diff(dateTime2, 'months').months);
    }
    default: {
      return N(dateTime1.diff(dateTime2, 'milliseconds').milliseconds, 1000n);
    }
  }
};
