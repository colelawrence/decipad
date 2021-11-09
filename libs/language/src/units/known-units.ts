import { singular } from './pluralize';
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
  | 'time'
  | 'substance'
  | 'electric current'
  | 'power'
  | 'luminous intensity'
  | 'information';

export type UnitOfMeasure = {
  name: string;
  baseQuantity: BaseQuantity;
  abbreviations?: string[];
  toBaseQuantity: (n: number) => number;
  fromBaseQuantity: (n: number) => number;
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

const unitsByName = allUnits.reduce((byName, unit) => {
  byName.set(unit.name, unit);
  if (unit.abbreviations) {
    for (const abbreviation of unit.abbreviations) {
      byName.set(abbreviation, unit);
    }
  }
  return byName;
}, new Map());

function normalizeUnitName(unit: string): string {
  return singular(unit.toLocaleLowerCase());
}

export function getUnitByName(unit: string): UnitOfMeasure | null {
  const n = normalizeUnitName(unit);
  return unitsByName.get(n);
}

export function knowsUnit(unit: string): boolean {
  return unitsByName.has(normalizeUnitName(unit));
}
