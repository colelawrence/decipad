import { produce } from '@decipad/utils';
import type { Unit } from '@decipad/language-interfaces';
import { isKnownSymbol } from '../units/known-units';
import { pluralize } from '../utils/langPluralize';

export const pluralizeUnit = (
  baseUnit: Unit,
  value: bigint | number = 2n
): Unit => {
  const { unit } = baseUnit;
  if (isKnownSymbol(unit)) {
    return baseUnit;
  }
  const pluralUnit = pluralize(unit, value);
  if (pluralUnit === unit) {
    return baseUnit;
  }
  return produce(baseUnit, (u) => {
    u.unit = pluralUnit;
  });
};
