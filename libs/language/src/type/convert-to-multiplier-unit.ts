import Fraction, { pow, toFraction } from '@decipad/fraction';
import { F } from '../utils';
import type { Unit } from '.';

function multipliersFor(units: Unit[]): Fraction {
  let acc = F(1);
  for (const unit of units) {
    acc = acc.mul(
      pow(toFraction(unit.multiplier as Fraction), unit.exp as Fraction)
    );
  }

  return acc;
}

export function convertToMultiplierUnit(
  n: Fraction,
  units?: Unit[] | null
): Fraction {
  if (!units) {
    return n;
  }
  const multiplier = multipliersFor(units);
  return n.div(multiplier);
}
