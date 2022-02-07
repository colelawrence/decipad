import Fraction from '@decipad/fraction';
import { Units, SerializedUnits } from '.';
import { F } from '../utils';

function multipliersFor(units: Units | SerializedUnits): Fraction {
  let acc = F(1);
  for (const unit of units.args) {
    acc = acc.mul(
      new Fraction(unit.multiplier as Fraction).pow(unit.exp as Fraction)
    );
  }

  return acc;
}

export function convertToMultiplierUnit(
  n: Fraction,
  units: Units | SerializedUnits | null
): Fraction {
  if (!units) {
    return n;
  }
  return n.div(multipliersFor(units));
}
