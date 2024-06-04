import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';
import type { Unit } from '@decipad/language-interfaces';

function multipliersFor(units: Unit[]): DeciNumberBase {
  let acc = ONE;
  for (const unit of units) {
    acc = acc.mul(unit.multiplier.pow(unit.exp));
  }

  return acc;
}

export function convertToMultiplierUnit(
  n: DeciNumberBase,
  units?: Unit[] | null
): DeciNumberBase {
  if (!units) {
    return n;
  }
  const multiplier = multipliersFor(units);
  return n.div(multiplier);
}
