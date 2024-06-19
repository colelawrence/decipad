import { Unit, UnitOfMeasure } from '@decipad/language-interfaces';
import { N, ONE } from '@decipad/number';

export const sameUnits = (
  unit: Unit[] | null | undefined,
  um: UnitOfMeasure
): boolean => {
  if (!unit || unit.length !== 1) {
    return false;
  }
  const u = unit[0];
  return (
    u.unit === um.name &&
    N(u.exp).equals(ONE) &&
    N(u.multiplier).equals(ONE) &&
    u.baseSuperQuantity === um.superBaseQuantity
  );
};
