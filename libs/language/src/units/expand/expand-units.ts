import DeciNumber, { ONE } from '@decipad/number';
import { produce, getDefined, identity } from '@decipad/utils';
import { UnitOfMeasure, getUnitByName, isBaseQuantity } from '../known-units';
import { normalizeUnits, Unit } from '../../type';
import { BaseQuantityExpansion, expansions } from './expansions';
import { baseUnitForBaseQuantity } from '../base-units';
import {
  Converter,
  ExpandUnitResult,
  ExpandUnitResultWithNullableUnits,
} from '.';
import { normalizeUnitNameString, normalizeUnitNames } from '../../type/units';

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

function convertingBy(mul: DeciNumber): Converter {
  return (n: DeciNumber) => n.mul(mul);
}

function expandUnitWith(unit: Unit, expansion: BaseQuantityExpansion): Unit[] {
  let first = true;
  return expansion.expandedUnits.map((expandedUnit) => {
    const targetUnitName = baseUnitForBaseQuantity(expandedUnit.baseQuantity);
    const newUnit = {
      unit: targetUnitName,
      exp: expandedUnit.exp.mul(unit.exp),
      multiplier: first ? unit.multiplier.pow(expandedUnit.exp) : ONE,
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
  const baseConversionFactor = uom.toBaseQuantity(ONE).pow(unit.exp);
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
        const expansionFactor = expandTo.convertToExpanded(ONE).pow(unit.exp);
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
  scale: ScaleConverter = identity,
  _converter: Converter = identity
): ExpandUnitResultWithNullableUnits {
  let units = _units;
  let converter = _converter;
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

function convertCompatibleUnitArgs(
  units: Unit[],
  _converter: Converter = identity
): ExpandUnitResult {
  let converter = _converter;
  const convertedUnits = units.map((sourceUnit) => {
    const knownSourceUnit = getUnitByName(sourceUnit.unit);
    if (knownSourceUnit) {
      for (const targetUnit of units) {
        if (
          targetUnit === sourceUnit ||
          !targetUnit.exp.equals(sourceUnit.exp)
        ) {
          continue;
        }

        const targetUnitName = normalizeUnitNameString(targetUnit.unit);
        if (
          isBaseQuantity(targetUnitName) &&
          knownSourceUnit.canConvertTo?.(targetUnitName) &&
          knownSourceUnit.convertTo != null
        ) {
          const targetUnitOfMeasure = getDefined(getUnitByName(targetUnitName));
          const previousConverter = converter;
          const { convertTo } = knownSourceUnit;
          if (convertTo != null) {
            console.log(
              `will apply converter to convert from ${knownSourceUnit.name} to ${targetUnitName}`
            );
            converter = (n) => {
              console.log(sourceUnit.unit, sourceUnit.exp.toString());
              const previousValue = previousConverter(n);
              console.log('previousValue', previousValue);
              return previousValue.mul(
                convertTo(targetUnitName, ONE).pow(sourceUnit.exp)
              );
            };
            return produce(sourceUnit, (sourceUnit) => {
              sourceUnit.unit = targetUnitOfMeasure.name;
            });
          }
        }
      }
    }
    return sourceUnit;
  });
  return [convertedUnits, converter];
}

function expandAndConvertUnitArgs(
  _units: Unit[],
  nonScalarExpansion: NonScalarExpansion = nonScalarExpansionFromBaseQuantity,
  scale: ScaleConverter = identity
): ExpandUnitResultWithNullableUnits {
  const [units, converter] = convertCompatibleUnitArgs(_units);
  return expandUnitArgs(units, nonScalarExpansion, scale, converter);
}

export function expandUnits(
  units?: Unit[] | null,
  nonScalarExpansion: NonScalarExpansion = nonScalarExpansionFromBaseQuantity,
  scale: ScaleConverter = identity
): ExpandUnitResultWithNullableUnits {
  if (!units?.length) {
    return [null, identity];
  }

  const [unitArgs, converter] = expandAndConvertUnitArgs(
    normalizeUnitNames(units),
    nonScalarExpansion,
    scale
  );

  return [unitArgs ?? [], converter];
}
