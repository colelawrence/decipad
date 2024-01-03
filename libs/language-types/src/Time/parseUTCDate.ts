import { getDefined } from '@decipad/utils';
import { arrayToDate } from './arrayToDate';

export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g)?.map((n) => BigInt(n));

  return getDefined(arrayToDate(getDefined(segments, `bad date ${iso}`)));
}
