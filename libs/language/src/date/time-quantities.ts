import { singular } from 'pluralize';
import { Time, timeUnitToJSDateUnit, toLuxonUTC, getTimeUnit } from '.';
import type { Unit } from '..';
import { RuntimeError } from '../value';
import { getDefined } from '../utils';

export const addTime = (
  date: bigint | undefined,
  timeUnit: Time.Unit,
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

export function timeUnitFromUnits(units: Unit[]): Time.Unit {
  if (units.length !== 1) {
    throw new RuntimeError(
      'Cannot construct time quantity from more than one unit of time'
    );
  }
  const unit = singular(units[0].unit);
  return getTimeUnit(unit);
}
