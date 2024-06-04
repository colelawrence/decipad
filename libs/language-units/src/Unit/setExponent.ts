import type { Unit } from '@decipad/language-interfaces';
import { produce } from '@decipad/utils';
import type { DeciNumberBase } from '@decipad/number';

export const setExponent = produce(
  (unit: Unit, newExponent: DeciNumberBase) => {
    unit.exp = newExponent;
  }
);
