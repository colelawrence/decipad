import { produce } from '@decipad/utils';
import { getUnitByName } from '../units/known-units';
import type { Unit } from './Unit';

export const normalizeUnitNameString = (unitName: string): string => {
  const symbolUnit = getUnitByName(unitName);
  return symbolUnit?.name ?? unitName;
};

export const normalizeUnitName = (unit: Unit): Unit => {
  const symbolUnit = normalizeUnitNameString(unit.unit);
  if (symbolUnit) {
    return produce(unit, (unit) => {
      unit.unit = symbolUnit;
    });
  }
  return unit;
};

export const normalizeUnitNames = (units: Unit[]): Unit[] => {
  return units.map(normalizeUnitName);
};
