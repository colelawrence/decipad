import Fraction from 'fraction.js';
import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';
import { Unit, Units } from '../parser/ast-types';
import { stringifyUnits } from '../type';
import { expandUnits } from './expand';

const FROM = 'from';
const TO = 'to';

function areSingleUnitsConvertible(a: Unit, b: Unit): boolean {
  if (!a.known && !b.known) {
    return (
      a.multiplier === b.multiplier && a.exp === b.exp && a.unit === b.unit
    );
  }
  const aUnit = getUnitByName(a.unit);
  if (!aUnit) {
    return false;
  }
  const bUnit = getUnitByName(b.unit);
  if (!bUnit) {
    return false;
  }

  return aUnit.baseQuantity === bUnit.baseQuantity && a.exp === b.exp;
}

export function areUnitsConvertible(unitsA: Units, unitsB: Units): boolean {
  const [sourceUnits] = expandUnits(unitsA.args);
  const [pendingMatchUnits] = expandUnits(Array.from(unitsB.args));

  if ((sourceUnits ?? []).length !== (pendingMatchUnits ?? []).length) {
    return false;
  }

  for (const oneSourceUnit of sourceUnits ?? []) {
    let convertibleTo: Unit | undefined;
    for (const oneTargetUnit of pendingMatchUnits ?? []) {
      if (areSingleUnitsConvertible(oneSourceUnit, oneTargetUnit)) {
        convertibleTo = oneTargetUnit;
        break;
      }
    }
    if (convertibleTo) {
      getDefined(pendingMatchUnits).splice(
        getDefined(pendingMatchUnits).indexOf(convertibleTo),
        1
      );
    }
  }

  // are every source unit matched to target unit?
  return (pendingMatchUnits ?? []).length === 0;
}

function convertBetweenSimpleUnits(
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
  if (!areSingleUnitsConvertible(from, to)) {
    throw new TypeError(
      `Don't know how to convert between ${from.unit} and ${to.unit}`
    );
  }

  const fromUnit = getDefined(getUnitByName(from.unit));
  const toUnit = getDefined(getUnitByName(to.unit));

  const { exp } = to; // equal to from.exp;

  if (fromUnit.doesNotScaleOnConversion || toUnit.doesNotScaleOnConversion) {
    if (exp === 1) {
      return toUnit.fromBaseQuantity(fromUnit.toBaseQuantity(n));
    } else {
      throw new TypeError(
        `Don't know how to convert between ${from.unit}^${from.exp} and ${to.unit}^${to.exp}`
      );
    }
  }

  const c1 = fromUnit
    .toBaseQuantity(new Fraction(1).mul(from.multiplier))
    .pow(exp);
  const c2 = toUnit.toBaseQuantity(new Fraction(1).mul(to.multiplier)).pow(exp);

  return n.mul(c1).div(c2);
}

export function convertBetweenUnits(
  n: Fraction,
  from: Units,
  to: Units
): Fraction {
  const [sourceUnits, convertToExpandedSource] = expandUnits(from.args);
  const [unmatchedUnits, convertToExpandedTarget] = expandUnits(
    Array.from(to.args)
  );

  return (sourceUnits ?? []).reduce((result, sourceUnit) => {
    let matchedUnit: Unit | undefined;
    for (const targetUnit of unmatchedUnits ?? []) {
      if (areSingleUnitsConvertible(sourceUnit, targetUnit)) {
        matchedUnit = targetUnit;
        break;
      }
    }
    if (matchedUnit) {
      getDefined(unmatchedUnits).splice(
        getDefined(unmatchedUnits).indexOf(matchedUnit),
        1
      );
      return convertBetweenSimpleUnits(result, sourceUnit, matchedUnit);
    } else {
      throw new TypeError(
        `Don't know how to convert between ${stringifyUnits(
          from
        )} and ${stringifyUnits(to)}: unit ${
          sourceUnit.unit
        } has no match to convert to`
      );
    }
  }, convertToExpandedSource(n).div(convertToExpandedTarget(new Fraction(1))));
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
