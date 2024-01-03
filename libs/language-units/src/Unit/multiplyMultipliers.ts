import DeciNumber, { ONE } from '@decipad/number';
import { Unit } from './Unit';

export function multiplyMultipliers(
  units: Unit[] | undefined | null,
  start: DeciNumber = ONE
): DeciNumber {
  if (!units) {
    return start;
  }
  let acc = start;
  for (const unit of units) {
    acc = acc.mul(unit.multiplier.pow(unit.exp));
  }
  return acc;
}
