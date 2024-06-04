import type { Unit } from '@decipad/language-interfaces';
import { setExponent } from './setExponent';

export const inverseExponent = (unit: Unit) =>
  setExponent(unit, unit.exp.neg());
