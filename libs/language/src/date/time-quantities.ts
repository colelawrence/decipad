import { singular } from 'pluralize';
import { Time, timeUnitToJSDateUnit, toLuxonUTC, getTimeUnit } from '.';
import type { Units } from '..';
import { RuntimeError } from '../interpreter/RuntimeError';
import { getDefined } from '../utils';

export const addTime = (
  date: bigint,
  timeUnit: Time.Unit,
  quantity: bigint
): bigint => {
  const [composedUnit, compositeMultiplier] = getDefined(
    timeUnitToJSDateUnit[timeUnit],
    `bad time unit ${timeUnit}`
  );

  const added = toLuxonUTC(date).plus({
    [composedUnit]: Number(BigInt(quantity) * compositeMultiplier),
  });

  return BigInt(added.toMillis());
};

export function timeUnitFromUnits(units: Units): Time.Unit {
  if (units.args.length !== 1) {
    throw new RuntimeError(
      'Cannot construct time quantity from more than one unit of time'
    );
  }
  const unit = singular(units.args[0].unit);
  return getTimeUnit(unit);
}
