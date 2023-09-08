import DeciNumber from '@decipad/number';
import * as AngleUnits from './angle-units';
import * as AreaUnits from './area-units';
import * as CurrencyUnits from './currency-units';
import * as ElectricChargeUnits from './electric-charge-units';
import * as ElectricCurrentUnits from './electric-current-units';
import * as ElectricalCapacitanceUnits from './electrical-capacitance-units';
import * as ElectricalConductanceUnits from './electrical-conductance-units';
import * as ElectricalResistanceUnits from './electrical-resistance-units';
import * as EnergyUnits from './energy-units';
import * as ForceUnits from './force-units';
import * as FrequencyUnits from './frequency-units';
import * as InformationUnits from './information-units';
import * as LengthUnits from './length-units';
import * as LuminousFlowUnits from './luminous-flow-units';
import * as LuminousIntensityUnits from './luminous-intensity-units';
import * as MassUnits from './mass-units';
import * as PowerUnits from './power-units';
import * as PressureUnits from './pressure-units';
import * as SolidAngleUnits from './solid-angle-units';
import * as SpeedUnits from './speed-units';
import * as SubstanceUnits from './substance-units';
import * as TemperatureUnits from './temperature-units';
import * as TimeUnits from './time-units';
import { doNotPluralize, normalizeUnitName } from './utils';
import * as VoltageUnits from './voltage-units';
import * as VolumeUnits from './volume-units';

const baseQuantities = [
  'length',
  'area',
  'volume',
  'pressure',
  'force',
  'energy',
  'mass',
  'temperature',
  'second',
  'month',
  'year',
  'substance',
  'electric current',
  'electric charge',
  'electrical capacitance',
  'electrical resistance',
  'electrical conductance',
  'luminous intensity',
  'luminous flow',
  'solid angle',
  'voltage',
  'speed',
  'power',
  'frequency',
  'information',
  'angle',
  'EUR',
  'USD',
  'GBP',
  'SEK',
  'XXX',
  'NOK',
  'UAH',
  'JPY',
  'CNY',
  'PHP',
  'INR',
  'RUB',
  'TRY',
  'KRW',
  'THB',
  'PLN',
  'ILS',
  'AED',
  'SAR',
  'AUD',
  'CAD',
  'CHF',
  'HKD',
  'NZD',
  'SGD',
  'ZAR',
  'BRL',
  'TWD',
  'DKK',
  'IDR',
  'HUF',
  'CZK',
  'CLP',
  'COP',
  'MYR',
  'RON',
  'BTC',
  'ETH',
] as const;

export type BaseQuantity = typeof baseQuantities[number];
const baseQuantitySet: ReadonlySet<string> = new Set(baseQuantities);

export const isBaseQuantity = (unit: string): unit is BaseQuantity =>
  baseQuantitySet.has(unit);

export type UnitOfMeasure = {
  name: string;
  baseQuantity: BaseQuantity;
  canConvertTo?: (unit: BaseQuantity) => boolean;
  convertTo?: (unit: BaseQuantity, n: DeciNumber) => DeciNumber;
  symbols?: string[];
  aliases?: string[];
  pretty?: string;
  doesNotScaleOnConversion?: true;
  toBaseQuantity: (n: DeciNumber) => DeciNumber;
  fromBaseQuantity: (n: DeciNumber) => DeciNumber;
  superBaseQuantity?: 'currency';
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
  SpeedUnits,
  CurrencyUnits,
  LuminousIntensityUnits,
  LuminousFlowUnits,
  SolidAngleUnits,
  AngleUnits,
];

const duplicates: Set<string> = new Set();

const symbols: string[] = [];
export const prettyForSymbol: Record<string, string> = {};

function makePrettyRecord(symbol: string, prty: string | undefined) {
  if (prty) {
    prettyForSymbol[symbol.toLowerCase()] = prty;
  }
}

allUnitPackages.map((x) => {
  x.units.map((unit) => {
    if (duplicates.has(unit.name)) {
      throw new Error(`Trying to declare twice ${unit.name}`);
    }
    duplicates.add(unit.name);
    makePrettyRecord(unit.name, unit.pretty);
    (unit.aliases || []).forEach((alias) => {
      if (duplicates.has(alias)) {
        throw new Error(`Trying to declare twice ${alias}`);
      }
      duplicates.add(alias);
      makePrettyRecord(alias, unit.pretty);
    });
    (unit.symbols || []).forEach((symbol) => {
      if (duplicates.has(symbol)) {
        throw new Error(`Trying to declare twice ${symbol}`);
      }
      symbols.push(symbol);
      duplicates.add(symbol);
      makePrettyRecord(symbol, unit.pretty);
    });
  });
});

export const unitIsSymbol = (unit: string): boolean => {
  return symbols.some((u) => u === unit);
};

symbols.map((symbol) => {
  doNotPluralize(symbol);
});

const allUnits: UnitOfMeasure[] = allUnitPackages.flatMap(
  (unitPackage) => unitPackage.units
);

const baseQuantitiesThatDoNotUseUnitPrefixes: Set<BaseQuantity> = new Set();
baseQuantitiesThatDoNotUseUnitPrefixes.add('area');
baseQuantitiesThatDoNotUseUnitPrefixes.add('volume');
baseQuantitiesThatDoNotUseUnitPrefixes.add('speed');

const allSymbols = new Map<string, UnitOfMeasure>();

export const unitsByName = allUnits.reduce<Map<string, UnitOfMeasure>>(
  (byName, unit) => {
    byName.set(unit.name, unit);
    if (unit.symbols) {
      for (const symbol of unit.symbols) {
        allSymbols.set(symbol, unit);
        byName.set(symbol.toLowerCase(), unit);
      }
    }
    if (unit.aliases) {
      for (const alias of unit.aliases) {
        byName.set(alias.toLowerCase(), unit);
      }
    }
    return byName;
  },
  new Map()
);

export function isKnownSymbol(symbol = ''): boolean {
  return !!symbol && allSymbols.has(symbol.toLowerCase());
}

export function getUnitByName(unit: string): UnitOfMeasure | undefined {
  const n = normalizeUnitName(unit);
  return unitsByName.get(n);
}

export function knowsUnit(unit: string): boolean {
  return unitsByName.has(normalizeUnitName(unit));
}

export function unitUsesPrefixes(unit: string): boolean {
  const n = getUnitByName(unit);
  //
  // this means user defined units can use prefixes by default
  // should we disable that?
  //
  if (!n) {
    return true;
  }
  return !baseQuantitiesThatDoNotUseUnitPrefixes.has(n.baseQuantity);
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

  const sameBaseQuantity = unitA.baseQuantity === unitB.baseQuantity;
  if (sameBaseQuantity) {
    return true;
  }

  const baseUnit = getUnitByName(unitA.baseQuantity);
  if (baseUnit?.canConvertTo?.(unitB.baseQuantity)) {
    return true;
  }
  return false;
}

export { CurrencyUnits };
