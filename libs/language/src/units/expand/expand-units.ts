import Fraction, { pow } from '@decipad/fraction';
import { produce } from 'immer';
import { getDefined } from '@decipad/utils';
import { UnitOfMeasure, getUnitByName } from '../known-units';
import { normalizeUnits, Unit } from '../../type';
import { BaseQuantityExpansion, expansions } from './expansions';
import { baseUnitForBaseQuantity } from '../base-units';
import { identity, F } from '../../utils';
import { Converter, ExpandUnitResult } from '.';
import { normalizeUnitNames } from '../../type/units';

export type NonScalarExpansion = (u: Unit) => [Unit, Converter];
export type ScaleConverter = (convert: Converter) => Converter;

function nonScalarExpansionFromBaseQuantity(u: Unit): [Unit, Converter] {
  const knownUnit = getDefined(getUnitByName(u.unit));
  const baseUnit = baseUnitForBaseQuantity(knownUnit.baseQuantity);
  const newUnits = produce(u, (unit) => {
    unit.unit = baseUnit;
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
      exp: expandedUnit.exp.mul(unit.exp),
      multiplier: first ? pow(unit.multiplier, F(expandedUnit.exp)) : F(1),
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
  const baseConversionFactor = pow(uom.toBaseQuantity(F(1)), F(unit.exp));
  const convert = convertingBy(baseConversionFactor);
  return [newUnit, convert];
}

export function expandUnit(
  unit: Unit,
  nonScalarExpansion: NonScalarExpansion = nonScalarExpansionFromBaseQuantity,
  scale: ScaleConverter = identity
): ExpandUnitResult {
  if (unit.unit) {
    const knownUnit = getUnitByName(unit.unit);
    if (knownUnit) {
      if (doesNotScaleOnConversion(unit)) {
        const [baseUnit, convertToBaseUnit] = nonScalarExpansion(unit);
        return [[baseUnit], convertToBaseUnit];
      }

      const expandTo = expansions[knownUnit.baseQuantity];
      const [baseUnit, convertToBaseUnit] = convertKnownUnitToBase(
        knownUnit,
        unit
      );

      if (expandTo) {
        const newUnits = expandUnitWith(baseUnit, expandTo);
        const expansionFactor = pow(
          expandTo.convertToExpanded(F(1)),
          F(unit.exp)
        );
        const convert: Converter = (n) =>
          convertToBaseUnit(n).mul(expansionFactor);

        return [newUnits, scale(convert)];
      }

      return [[baseUnit], scale(convertToBaseUnit)];
    }
  }
  return [[unit], identity];
}

function expandUnitArgs(
  _units: Unit[],
  nonScalarExpansion: NonScalarExpansion = nonScalarExpansionFromBaseQuantity,
  scale: ScaleConverter = identity
): [Unit[] | null, Converter] {
  let units = _units;
  let converter: Converter = identity;
  let beforeCount = units.length;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [expandedUnits, newConverter] = units
      .map((u) => expandUnit(u, nonScalarExpansion, scale))
      .reduce(
        ([allExpandedUnits, allConverters], [expandedUnits, converter]) => [
          [...allExpandedUnits, ...expandedUnits],
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

export function expandUnits(
  units: Unit[] | null,
  nonScalarExpansion: NonScalarExpansion = nonScalarExpansionFromBaseQuantity,
  scale: ScaleConverter = identity
): [Unit[] | null, Converter] {
  if (!units?.length) {
    return [null, identity];
  }

  const [unitArgs, converter] = expandUnitArgs(
    normalizeUnitNames(units),
    nonScalarExpansion,
    scale
  );

  return [unitArgs ?? [], converter];
}
