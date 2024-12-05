import { startOfDate } from '@decipad/utils';
import type * as Time from './Time';
import { dateToArray } from './dateToArray';
import { arrayToDate } from './arrayToDate';

const timeUnitToJSTimeIndex: Record<Time.TimeUnit, number> = {
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

export const cleanDate = (
  date: bigint | number | undefined,
  specificity: Time.Specificity
): bigint | undefined => {
  if (date == null) {
    return undefined;
  }
  if (specificity === 'quarter' || specificity === 'week') {
    // we must treat quarters and weeks specially because
    // they must end on the beginning of the period
    // otherwise, comparisons with roundings will fail.
    return startOfDate(BigInt(date), specificity);
  }

  const necessarySegments = dateToArray(date).slice(
    0,
    timeUnitToJSTimeIndex[specificity] + 1
  );

  return arrayToDate(necessarySegments);
};
