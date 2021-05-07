import produce from 'immer';
import { n, pairwise } from '../utils';

/* Warning: extremely hacky
 *
 * There was an initial version of this code which used date-fns, however its
 * UTC support leaves a lot to be desired. They're working on a new date-fns/utc
 * which I think we should adopt as soon as it comes out
 *
 * For now, here's some nonsense about turning dates into arrays and back:
 */

const dateSpecificities = ['year', 'quarter', 'month', 'day', 'time'];
const timeSpecificities = new Set(['hour', 'minute', 'second', 'millisecond']);

export type DateSpecificity = typeof dateSpecificities[number];

const getSpecificity = (
  thing?: string | number | AST.TZInfo
): DateSpecificity => {
  /* istanbul ignore else */
  if (typeof thing === 'string') {
    if (dateSpecificities.includes(thing)) {
      return thing;
    }
    if (timeSpecificities.has(thing)) {
      return 'time';
    }
  }

  throw new Error('panic: expected DateSpecificity, got ' + thing);
};

const specificityToIndex: Record<string, number> = {
  year: 0,
  month: 1,
  day: 2,
};

// Dates are ranges -- this function cuts up a date to its closest specificity
export const cleanDate = (date: number, specificity: DateSpecificity) => {
  if (specificity === 'time') return [date, date];

  const segmentsAtRangeStart = dateToArray(date).slice(
    0,
    specificityToIndex[specificity] + 1
  );
  const segmentsAtRangeEnd = produce(segmentsAtRangeStart, (newSegments) => {
    const last = newSegments.length - 1;
    newSegments[last] += 1;
  });

  return [
    arrayToDate(segmentsAtRangeStart)[0],
    arrayToDate(segmentsAtRangeEnd)[0] - 1,
  ];
};

const getDateSegment = (
  thing: number | string | AST.TZInfo | undefined,
  isMonth: boolean
): number | null => {
  if (typeof thing === 'string') {
    thing = Number(thing.replace(/^0+/, ''));
  }

  if (typeof thing === 'number' && !isNaN(thing)) {
    if (isMonth) {
      return thing - 1;
    } else {
      return thing;
    }
  } else {
    return null;
  }
};

export function arrayToDate(
  segments: (string | number | AST.TZInfo | undefined)[]
): [number, DateSpecificity] {
  const nameAndNumber = [
    ['year', segments[0]],
    ['month', segments[1]],
    ['day', segments[2]],
    ['time', segments[3]],
    ['time', segments[4]],
    ['time', segments[5]],
    ['time', segments[6]],
  ];

  const dateArgs: number[] = [];
  let lastSegment: DateSpecificity = 'year';
  for (const [segName, segValue] of nameAndNumber) {
    const segNumber = getDateSegment(segValue, segName === 'month');

    if (segNumber != null) {
      dateArgs.push(segNumber);
      lastSegment = getSpecificity(segName);
    } else {
      break;
    }
  }

  return [
    Date.UTC(dateArgs[0], dateArgs[1] || 0, ...dateArgs.slice(2)),
    lastSegment,
  ];
}

export const dateNodeToSpecificity = (node: AST.Date): DateSpecificity => {
  let lowestSegment: DateSpecificity = 'year';

  for (const [segment, _] of pairwise<string, unknown>(node.args)) {
    lowestSegment = getSpecificity(segment);
  }

  return lowestSegment;
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

export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g);

  if (segments != null) {
    return arrayToDate(segments)[0];
  } else {
    throw new Error('bad date: ' + iso);
  }
}

export function date(parsableDate: string, specificity: 'month' | 'day') {
  const dateArray = dateToArray(parseUTCDate(parsableDate));

  const args: AST.Date['args'] = ['year', dateArray[0], 'month', dateArray[1]];

  if (specificity === 'day') {
    args.push('day', dateArray[2]);
  }

  return n('date', ...args);
}

export function stringifyDate(
  date: number,
  specificity: DateSpecificity
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

export const getDateFromAstForm = (
  segments: AST.Date['args']
): [number, DateSpecificity] => {
  return arrayToDate([
    segments[1],
    segments[3],
    segments[5],
    segments[7],
    segments[9],
    segments[11],
  ]);
};
