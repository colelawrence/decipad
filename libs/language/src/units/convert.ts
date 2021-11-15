import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';

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
  n: number,
  from: string,
  to: string
): number {
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

export function convertFromBaseUnitIfKnown(n: number, from: string): number {
  const unit = getUnitByName(from);
  if (unit) {
    return unit.fromBaseQuantity(n);
  }
  return n;
}

export function convertToBaseUnitIfKnown(n: number, to: string): number {
  const unit = getUnitByName(to);
  if (unit) {
    return unit.toBaseQuantity(n);
  }
  return n;
}
