import DeciNumber, { ONE } from '@decipad/number';
import type { Unit } from '.';

function multipliersFor(units: Unit[]): DeciNumber {
  let acc = ONE;
  for (const unit of units) {
    acc = acc.mul(unit.multiplier.pow(unit.exp));
  }

  return acc;
}

export function convertToMultiplierUnit(
  n: DeciNumber,
  units?: Unit[] | null
): DeciNumber {
  if (!units) {
    return n;
  }
  const multiplier = multipliersFor(units);
  return n.div(multiplier);
}
