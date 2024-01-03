// eslint-disable-next-line no-restricted-imports
import { singular, addIrregularRule } from '@decipad/language-utils';

export function normalizeUnitName(unit: string): string {
  return singular(unit.toLocaleLowerCase());
}

export function doNotPluralize(abbr: string): void {
  const aux = abbr.toLocaleLowerCase();
  addIrregularRule(aux, aux);
}
