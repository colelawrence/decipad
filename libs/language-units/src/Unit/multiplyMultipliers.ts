import type { Unit } from '@decipad/language-interfaces';
import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';

export function multiplyMultipliers(
  units: Unit[] | undefined | null,
  start: DeciNumberBase = ONE
): DeciNumberBase {
  if (!units) {
    return start;
  }
  let acc = start;
  for (const unit of units) {
    acc = acc.mul(unit.multiplier.pow(unit.exp));
  }
  return acc;
}
