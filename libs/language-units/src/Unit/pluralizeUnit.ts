import { produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { pluralize } from '@decipad/language-utils';
import { isKnownSymbol } from '../units/known-units';
import { Unit } from './Unit';

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
