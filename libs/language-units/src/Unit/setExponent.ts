import DeciNumber from '@decipad/number';
import { produce } from '@decipad/utils';
import { Unit } from './Unit';

export const setExponent = produce((unit: Unit, newExponent: DeciNumber) => {
  unit.exp = newExponent;
});
