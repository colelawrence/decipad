import Fraction from 'fraction.js';
import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';

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
  from: string,
  to: string
): Fraction {
  if (from === to) {
    return n;
  }
  if (!areUnitsConvertible(from, to)) {
    throw new TypeError(`Don't know how to convert between ${from} and ${to}`);
  }

  const fromUnit = getDefined(getUnitByName(from));
  const toUnit = getDefined(getUnitByName(to));

  return toUnit.fromBaseQuantity(fromUnit.toBaseQuantity(n));
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
    if (pow === 1) {
      return convert(n);
    }
    return n.mul(convert(new Fraction(1)).pow(pow));
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
