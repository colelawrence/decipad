import { areUnitsCompatible } from '../units/known-units';
import type { Unit } from './Unit';
import { expandUnits } from './expand/expand-units';

export const matchUnitArrays = (
  units1?: Unit[] | null,
  units2?: Unit[] | null
): boolean => {
  const [expandedUnit1] = expandUnits(units1);
  const expandedUnits1 = expandedUnit1 ?? [];
  const [expandedUnit2] = expandUnits(units2);
  const expandedUnits2 = expandedUnit2 ?? [];
  if (expandedUnits1.length !== expandedUnits2.length) {
    return false;
  }

  const pendingMatch = Array.from(expandedUnits2);
  for (const unit of expandedUnits1) {
    let match: Unit | undefined;
    for (const matchingUnit of pendingMatch) {
      if (
        unit.exp.compare(matchingUnit.exp) === 0 &&
        areUnitsCompatible(unit.unit, matchingUnit.unit)
      ) {
        match = matchingUnit;
        break;
      }
    }
    if (match) {
      pendingMatch.splice(pendingMatch.indexOf(match), 1);
    } else {
      return false;
    }
  }

  return pendingMatch.length === 0;
};
