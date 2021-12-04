import Fraction from 'fraction.js';
import { normalizeUnitName } from './utils';
import * as LengthUnits from './length-units';
import * as AreaUnits from './area-units';
import * as VolumeUnits from './volume-units';
import * as PressureUnits from './pressure-units';
import * as EnergyUnits from './energy-units';
import * as ForceUnits from './force-units';
import * as MassUnits from './mass-units';
import * as TemperatureUnits from './temperature-units';
import * as TimeUnits from './time-units';
import * as InformationUnits from './information-units';
import * as SubstanceUnits from './substance-units';
import * as ElectricCurrentUnits from './electric-current-units';
import * as ElectricChargeUnits from './electric-charge-units';
import * as VoltageUnits from './voltage-units';
import * as ElectricalCapacitanceUnits from './electrical-capacitance-units';
import * as ElectricalResistanceUnits from './electrical-resistance-units';
import * as ElectricalConductanceUnits from './electrical-conductance-units';
import * as PowerUnits from './power-units';
import * as FrequencyUnits from './frequency-units';
import * as CurrencyUnits from './currency-units';

export type BaseQuantity =
  | 'length'
  | 'area'
  | 'volume'
  | 'pressure'
  | 'force'
  | 'energy'
  | 'mass'
  | 'temperature'
  | 'second'
  | 'month'
  | 'substance'
  | 'electric current'
  | 'electric charge'
  | 'electrical capacitance'
  | 'electrical resistance'
  | 'electrical conductance'
  | 'voltage'
  | 'power'
  | 'frequency'
  | 'information'
  | '$EUR'
  | '$USD'
  | '$GBP'
  | '$SEK';

export type UnitOfMeasure = {
  name: string;
  baseQuantity: BaseQuantity;
  abbreviations?: string[];
  pretty?: (n: Fraction) => string;
  doesNotScaleOnConversion?: true;
  toBaseQuantity: (n: Fraction) => Fraction;
  fromBaseQuantity: (n: Fraction) => Fraction;
};

const allUnitPackages = [
  LengthUnits,
  AreaUnits,
  VolumeUnits,
  PressureUnits,
  EnergyUnits,
  ForceUnits,
  MassUnits,
  TemperatureUnits,
  TimeUnits,
  InformationUnits,
  SubstanceUnits,
  ElectricCurrentUnits,
  ElectricChargeUnits,
  VoltageUnits,
  ElectricalCapacitanceUnits,
  ElectricalResistanceUnits,
  ElectricalConductanceUnits,
  PowerUnits,
  FrequencyUnits,
  CurrencyUnits,
];

const allUnits: UnitOfMeasure[] = allUnitPackages.flatMap(
  (unitPackage) => unitPackage.units
);

const allSymbols = new Map<string, UnitOfMeasure>();

export const unitsByName = allUnits.reduce((byName, unit) => {
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
