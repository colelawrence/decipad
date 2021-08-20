import { AST } from '..';
import { n, pairwise, getDefined } from '../utils';
import * as Time from './time-types';

export * from './time-quantities';
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

const dateSpecificities = ['year', 'month', 'day', 'time'];
const timeSpecificities = ['hour', 'minute', 'second', 'millisecond'];

export const timeUnitToJSDateUnit: Record<
  Time.Unit,
  [Time.JSDateUnit, number]
> = {
  year: ['year', 1],
  quarter: ['month', 3],
  month: ['month', 1],
  week: ['day', 7],
  day: ['day', 1],
  hour: ['hour', 1],
  minute: ['minute', 1],
  second: ['second', 1],
  millisecond: ['millisecond', 1],
};

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

export const timeUnitToIndex: Record<Time.Unit, number> = {
  year: 0,
  quarter: 1,
  month: 2,
  week: 3,
  day: 4,
  hour: 5,
  minute: 6,
  second: 7,
  millisecond: 8,
};

// Deal with annoying intersections
type AnyUnit = Time.Unit | Time.Specificity | Time.JSDateUnit;

export const getSpecificity = (thing?: string): Time.Specificity => {
  /* istanbul ignore else */
  if (typeof thing === 'string') {
    if (thing in timeUnitToJSDateUnit) {
      // Eliminate quarter, week
      [thing] = timeUnitToJSDateUnit[thing as Time.Unit];
    }

    if (dateSpecificities.includes(thing)) {
      return thing as Time.Specificity;
    }
    if (timeSpecificities.includes(thing)) {
      return 'time';
    }
  }

  throw new Error(`panic: expected Time.Specificity, got ${thing}`);
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
  const leftIdx = dateSpecificities.indexOf(getSpecificity(left));
  const rightIdx = dateSpecificities.indexOf(getSpecificity(right));

  return Math.sign(leftIdx - rightIdx);
};

export const sortSpecificities = (specificities: AnyUnit[]) => {
  const uniqueSpecificities = [
    ...new Set(specificities.map((s) => getSpecificity(s))),
  ];
  return uniqueSpecificities.sort((a, b) => cmpSpecificities(a, b));
};

export const sortTimeUnits = (toSort: Iterable<Time.Unit>) => {
  const uniqueUnits = [...new Set(toSort)];
  return uniqueUnits.sort((a, b) =>
    Math.sign(timeUnitToIndex[a] - timeUnitToIndex[b])
  );
};

export const getHighestSpecificity = (specificities: AnyUnit[]) =>
  getDefined(sortSpecificities(specificities).pop());

const cmpJSDateUnits = (left: Time.JSDateUnit, right: Time.JSDateUnit) => {
  const leftIdx = jsUnitToIndex[left];
  const rightIdx = jsUnitToIndex[right];

  return Math.sign(leftIdx - rightIdx);
};

// Dates are ranges -- this function cuts up a date to its closest specificity
export const cleanDate = (date: number, specificity: Time.Specificity) => {
  if (specificity === 'time') return date;

  const necessarySegments = dateToArray(date).slice(
    0,
    jsUnitToIndex[specificity] + 1
  );

  return arrayToDate(necessarySegments);
};

export const dateToArray = (date: Date | number) => {
  const d = new Date(date);

  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  ];
};

const getDateSegment = (
  thing: number | string | AST.TZInfo | undefined,
  isMonth: boolean
): number | null => {
  if (typeof thing === 'string') {
    thing = Number(thing.replace(/^0+/, ''));
  }

  if (typeof thing === 'number' && !Number.isNaN(thing)) {
    return thing - Number(isMonth);
  } else {
    return null;
  }
};

export function arrayToDate(
  segments: (string | number | AST.TZInfo | undefined)[]
): number {
  const nameAndNumber: [string, string | number | AST.TZInfo | undefined][] = [
    ['year', segments[0]],
    ['month', segments[1]],
    ['day', segments[2]],
    ['time', segments[3]],
    ['time', segments[4]],
    ['time', segments[5]],
    ['time', segments[6]],
  ];

  const dateArgs: number[] = [];
  for (const [segName, segValue] of nameAndNumber) {
    const segNumber = getDateSegment(segValue, segName === 'month');

    if (segNumber != null) {
      dateArgs.push(segNumber);
    } else {
      break;
    }
  }

  return Date.UTC(dateArgs[0], dateArgs[1] || 0, ...dateArgs.slice(2));
}

export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g);

  return arrayToDate(getDefined(segments, `bad date ${iso}`));
}

export function date(
  parsableDate: string,
  specificity: Time.JSDateUnit
): AST.Date {
  const dateArray = dateToArray(parseUTCDate(parsableDate));

  const args: AST.Date['args'] = [];

  for (const [unit, index] of Object.entries(jsUnitToIndex)) {
    args.push(unit as Time.JSDateUnit, dateArray[index]);

    if (cmpJSDateUnits(unit as Time.JSDateUnit, specificity) === 0) {
      break;
    }
  }

  return n('date', ...args);
}

export function stringifyDate(
  date: number,
  specificity: Time.Specificity
): string {
  const segments = dateToArray(date);

  const pad = (x: number | string) => String(x).padStart(2, '0');

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
): Time.Specificity => {
  let lowestSegment: Time.Specificity = 'year';

  for (const [segment] of pairwise<Time.Unit, unknown>(nodeArgs)) {
    lowestSegment = getSpecificity(segment);
  }

  return lowestSegment;
};

export const getDateFromAstForm = (
  segments: AST.Date['args']
): [number, Time.Specificity] => {
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
