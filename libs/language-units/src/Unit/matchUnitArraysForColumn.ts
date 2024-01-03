import { lenientZip } from '@decipad/utils';
import { Unit } from './Unit';
import { normalizeUnits } from './normalizeUnits';

export const matchUnitArraysForColumn = (
  _units1?: Unit[] | null,
  _units2?: Unit[] | null
) => {
  const units1 = normalizeUnits(_units1) ?? [];
  const units2 = normalizeUnits(_units2) ?? [];

  if ((units1.length === 0) !== (units2.length === 0)) {
    return true;
  }

  return lenientZip(units1, units2).every(([left, right]) => {
    if (left == null || right == null) {
      return false;
    }

    return (
      left.unit === right.unit &&
      left.multiplier.compare(right.multiplier) === 0 &&
      left.exp.compare(right.exp) === 0
    );
  });
};
