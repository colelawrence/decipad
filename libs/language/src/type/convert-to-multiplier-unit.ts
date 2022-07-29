import Fraction, { pow } from '@decipad/fraction';
import { SerializedUnits, Units } from '.';
import { F } from '../utils';

function multipliersFor(units: Units | SerializedUnits): Fraction {
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
  units?: Units | SerializedUnits | null
): Fraction {
  if (!units) {
    return n;
  }
  const multiplier = multipliersFor(units);
  return n.div(multiplier);
}
