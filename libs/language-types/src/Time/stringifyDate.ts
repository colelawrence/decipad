import { UNKNOWN_ASSTRING } from '@decipad/number';
import type { Specificity } from './Time';
import { dateToArray } from './dateToArray';

const pad = (x: bigint | string) => String(x).padStart(2, '0');

export function stringifyDate(
  date: bigint | number | undefined | symbol,
  specificity: Specificity
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
