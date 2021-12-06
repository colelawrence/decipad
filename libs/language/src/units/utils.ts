import { singular } from '../pluralize';

export function normalizeUnitName(unit: string): string {
  return singular(unit.toLocaleLowerCase());
}

export function sameUnit(unitA: string, unitB: string): boolean {
  return normalizeUnitName(unitA) === normalizeUnitName(unitB);
}
