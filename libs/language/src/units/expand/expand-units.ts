import Fraction from '@decipad/fraction';
import { produce } from 'immer';
import { getDefined } from '@decipad/utils';
import { UnitOfMeasure, getUnitByName } from '../known-units';
import { normalizeUnits, Unit, Units } from '../../type';
import { BaseQuantityExpansion, expansions } from './expansions';
import { baseUnitForBaseQuantity } from '../base-units';
import { identity, F } from '../../utils';
import { Converter, ExpandUnitResult } from '.';
import { stringifyUnits } from '../../type/units';

function nonScalarExpansion(units: Units): [Units, Converter] {
  const u = units?.args || [];
  if (u.length !== 1) {
    throw new TypeError(
      `Don't know how to expand non-scalar unit ${stringifyUnits(units)}`
    );
  }
  const knownUnit = getDefined(getUnitByName(u[0].unit));
  const baseUnit = baseUnitForBaseQuantity(knownUnit.baseQuantity);
  const newUnits = produce(units, (units) => {
    units.args = units.args.map((u) =>
      produce(u, (u) => {
        u.unit = baseUnit;
      })
    );
  });

  return [newUnits, knownUnit.toBaseQuantity];
}

export function doesNotScaleOnConversion(unit: Unit): boolean {
  const knownUnit = getUnitByName(unit.unit);
  if (knownUnit) {
    return !!knownUnit.doesNotScaleOnConversion;
  }
  return false;
}

function convertingBy(mul: Fraction): Converter {
  return (n: Fraction) => n.mul(mul);
}

function expandUnitWith(unit: Unit, expansion: BaseQuantityExpansion): Unit[] {
  let first = true;
  return expansion.expandedUnits.map((expandedUnit) => {
    const targetUnitName = baseUnitForBaseQuantity(expandedUnit.baseQuantity);
    const newUnit = {
      unit: targetUnitName,
      exp: BigInt(expandedUnit.exp) * unit.exp,
      // multiplier: first ? unit.multiplier ** expandedUnit.exp : 1,
      multiplier: first ? unit.multiplier.pow(Number(expandedUnit.exp)) : F(1),
      known: true,
    };
    first = false;
    return newUnit;
  });
}

function convertKnownUnitToBase(
  uom: UnitOfMeasure,
  unit: Unit
): [Unit, Converter] {
  const baseUnit = baseUnitForBaseQuantity(uom.baseQuantity);
  if (baseUnit === uom.name) {
    return [unit, identity];
  }
  const newUnit = produce(unit, (unit) => {
    unit.unit = baseUnit;
  });
  const baseConversionFactor = uom.toBaseQuantity(F(1)).pow(F(unit.exp));
  const convert = convertingBy(baseConversionFactor);
  return [newUnit, convert];
}

function expandUnit(unit: Unit): ExpandUnitResult {
  if (unit.unit) {
    const knownUnit = getUnitByName(unit.unit);
    if (knownUnit) {
      const expandTo = expansions[knownUnit.baseQuantity];
      const [baseUnit, convertToBaseUnit] = convertKnownUnitToBase(
        knownUnit,
        unit
      );

      if (expandTo) {
        const newUnits = expandUnitWith(baseUnit, expandTo);
        const expansionFactor = expandTo
          .convertToExpanded(F(1))
          .pow(F(unit.exp));
        const convert: Converter = (n) =>
          convertToBaseUnit(n).mul(expansionFactor);

        return [newUnits, convert];
      }

      return [[baseUnit], convertToBaseUnit];
    }
  }
  return [[unit], identity];
}

function expandUnitArgs(_units: Unit[]): [Unit[] | null, Converter] {
  let units = _units;
  let converter: Converter = identity;
  let beforeCount = units.length;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [expandedUnits, newConverter] = units
      .map(expandUnit)
      .reduce(
        ([allExpandedUnits, allConverters], [expandedUnits, converter]) => [
          [...(allExpandedUnits ?? []), ...expandedUnits],
          (n) => allConverters(converter(n)),
        ],
        [[], converter]
      );
    units = normalizeUnits(expandedUnits) ?? [];
    converter = newConverter;
    if (units.length === beforeCount) {
      break;
    }
    beforeCount = units.length;
  }
  return [units, converter];
}

export function expandUnits(units: Units | null): [Units | null, Converter] {
  if (units === null) {
    return [null, identity];
  }
  if (units.args.some(doesNotScaleOnConversion)) {
    return nonScalarExpansion(units);
  }
  const [unitArgs, converter] = expandUnitArgs(units.args);
  return [
    produce(units, (u) => {
      u.args = unitArgs ?? [];
    }),
    converter,
  ];
}
