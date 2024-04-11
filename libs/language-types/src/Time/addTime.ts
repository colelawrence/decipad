import { getDefined } from '@decipad/utils';
import type * as Time from './Time';
import { timeUnitToJSDateUnit } from './timeUnitToJsDateUnit';
import { toLuxonUTC } from './toLuxonUTC';

/**
 * Create a Luxon DateTime without a timezone offset from a date-like arg
 */
export const addTime = (
  date: bigint | undefined,
  timeUnit: Time.TimeUnit,
  quantity: bigint
): bigint | undefined => {
  if (date == null) {
    return undefined;
  }
  const [composedUnit, compositeMultiplier] = getDefined(
    timeUnitToJSDateUnit[timeUnit],
    `bad time unit ${timeUnit}`
  );

  const added = toLuxonUTC(date).plus({
    [composedUnit]: Number(BigInt(quantity) * compositeMultiplier),
  });

  return BigInt(added.toMillis());
};
