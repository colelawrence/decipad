import type { Unit } from '@decipad/language-interfaces';
import { simplifyUnits } from './simplifyUnits';

const byUnitName = (a: Unit, b: Unit): number => {
  if (a.unit > b.unit) {
    return 1;
  } else if (a.unit < b.unit) {
    return -1;
  } else {
    return 0;
  }
};

export const normalizeUnits = (
  units?: Unit[] | null,
  { mult = false }: { mult?: boolean } = {}
): Unit[] | null => {
  if (!units?.length) {
    return null;
  }

  const simplified = simplifyUnits(units);

  if (simplified.length === 0) {
    return null;
  } else if (mult) {
    return simplified;
  } else {
    return simplified.sort(byUnitName);
  }
};
