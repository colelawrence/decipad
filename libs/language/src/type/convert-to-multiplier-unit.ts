import Fraction, { pow } from '@decipad/fraction';
import { F } from '../utils';
import type { Units } from '.';

function multipliersFor(units: Units): Fraction {
  let acc = F(1);
  for (const unit of units.args) {
    acc = acc.mul(
      pow(new Fraction(unit.multiplier as Fraction), unit.exp as Fraction)
    );
  }

  return acc;
}

export function convertToMultiplierUnit(
  n: Fraction,
  units?: Units | null
): Fraction {
  if (!units) {
    return n;
  }
  const multiplier = multipliersFor(units);
  return n.div(multiplier);
}
