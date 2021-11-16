import Fraction from 'fraction.js';
import { normalizeUnitName } from './utils';
import * as LengthUnits from './length-units';
import * as VolumeUnits from './volume-units';
import * as PressureUnits from './pressure-units';
import * as EnergyUnits from './energy-units';
import * as MassUnits from './mass-units';
import * as TemperatureUnits from './temperature-units';
import * as TimeUnits from './time-units';
import * as InformationUnits from './information-units';
import * as SubstanceUnits from './substance-units';
import * as ElectricCurrentUnits from './electric-current-units';
import * as PowerUnits from './power-units';

type BaseQuantity =
  | 'length'
  | 'volume'
  | 'pressure'
  | 'energy'
  | 'mass'
  | 'temperature'
  | 'second'
  | 'day'
  | 'month'
  | 'substance'
  | 'electric current'
  | 'power'
  | 'information';

export type UnitOfMeasure = {
  name: string;
  baseQuantity: BaseQuantity;
  abbreviations?: string[];
  doesNotScaleOnConversion?: true;
  toBaseQuantity: (n: Fraction) => Fraction;
  fromBaseQuantity: (n: Fraction) => Fraction;
};

const allUnits: UnitOfMeasure[] = [
  ...LengthUnits.units,
  ...VolumeUnits.units,
  ...PressureUnits.units,
  ...EnergyUnits.units,
  ...MassUnits.units,
  ...TemperatureUnits.units,
  ...TimeUnits.units,
  ...InformationUnits.units,
  ...SubstanceUnits.units,
  ...ElectricCurrentUnits.units,
  ...PowerUnits.units,
];

const allSymbols = new Map<string, UnitOfMeasure>();

const unitsByName = allUnits.reduce((byName, unit) => {
  byName.set(unit.name, unit);
  if (unit.abbreviations) {
    for (const abbreviation of unit.abbreviations) {
      allSymbols.set(abbreviation, unit);
      byName.set(abbreviation.toLowerCase(), unit);
    }
  }
  return byName;
}, new Map());

export function isKnownSymbol(symbol: string): boolean {
  return allSymbols.has(symbol.toLowerCase());
}

export function getUnitByName(unit: string): UnitOfMeasure | null {
  const n = normalizeUnitName(unit);
  return unitsByName.get(n);
}

export function knowsUnit(unit: string): boolean {
  return unitsByName.has(normalizeUnitName(unit));
}

export function areUnitsCompatible(
  unitAName: string,
  unitBName: string
): boolean {
  const unitA = getUnitByName(unitAName);
  const unitB = getUnitByName(unitBName);

  if (!unitA && !unitB) {
    return normalizeUnitName(unitAName) === normalizeUnitName(unitBName);
  }

  if (!unitA || !unitB) {
    return false;
  }

  return unitA.baseQuantity === unitB.baseQuantity;
}
