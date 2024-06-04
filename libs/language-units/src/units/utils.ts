import { addIrregularRule, singular } from '../utils/langPluralize';

export function normalizeUnitName(unit: string): string {
  return singular(unit.toLocaleLowerCase());
}

export function doNotPluralize(abbr: string): void {
  const aux = abbr.toLocaleLowerCase();
  addIrregularRule(aux, aux);
}
