import Fraction from 'fraction.js';
import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';
import { Unit } from '../parser/ast-types';

const FROM = 'from';
const TO = 'to';

export function areUnitsConvertible(a: string, b: string): boolean {
  const aUnit = getUnitByName(a);
  if (!aUnit) {
    return false;
  }
  const bUnit = getUnitByName(b);
  if (!bUnit) {
    return false;
  }

  if (aUnit.baseQuantity !== bUnit.baseQuantity) {
    return false;
  }

  return true;
}

export function convertBetweenUnits(
  n: Fraction,
  from: Unit,
  to: Unit
): Fraction {
  if (
    from.unit === to.unit &&
    from.multiplier === to.multiplier &&
    from.exp === to.exp
  ) {
    return n;
  }
  if (!areUnitsConvertible(from.unit, to.unit)) {
    throw new TypeError(
      `Don't know how to convert between ${from.unit} and ${to.unit}`
    );
  }

  const fromUnit = getDefined(getUnitByName(from.unit));
  const toUnit = getDefined(getUnitByName(to.unit));

  return toUnit
    .fromBaseQuantity(fromUnit.toBaseQuantity(n.mul(from.multiplier)))
    .div(to.multiplier || 1);
}

function convert(
  direction: 'from' | 'to',
  n: Fraction,
  unitName: string,
  pow: number
) {
  const unit = getUnitByName(unitName);
  if (unit) {
    const convert =
      direction === FROM ? unit.fromBaseQuantity : unit.toBaseQuantity;
    if (unit.doesNotScaleOnConversion && pow !== 1) {
      throw new TypeError(`Cannot convert from ${unitName} with pow not 1`);
    }
    return pow === 1 ? convert(n) : n.mul(convert(new Fraction(1)).pow(pow));
  }
  return n;
}

export function convertFromBaseUnitIfKnown(
  n: Fraction,
  from: string,
  pow: number
): Fraction {
  return convert(FROM, n, from, pow);
}

export function convertToBaseUnitIfKnown(
  n: Fraction,
  to: string,
  pow: number
): Fraction {
  return convert(TO, n, to, pow);
}
