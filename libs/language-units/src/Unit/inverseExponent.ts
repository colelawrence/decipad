import { Unit } from './Unit';
import { setExponent } from './setExponent';

export const inverseExponent = (unit: Unit) =>
  setExponent(unit, unit.exp.neg());
