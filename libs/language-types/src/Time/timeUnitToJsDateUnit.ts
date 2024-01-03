import * as Time from './Time';

export const timeUnitToJSDateUnit: Readonly<
  Record<Time.TimeUnit, [Time.JSDateUnit, bigint] | undefined>
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
