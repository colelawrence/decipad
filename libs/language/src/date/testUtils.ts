import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Time } from '@decipad/language-types';

export function parseUTCDate(iso: string) {
  const segments = iso.match(/(\d+)/g)?.map((n) => BigInt(n));

  return getDefined(Time.arrayToDate(getDefined(segments, `bad date ${iso}`)));
}
