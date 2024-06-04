import { produce } from '@decipad/utils';
import { N } from '@decipad/number';
import type { Unit } from '@decipad/language-interfaces';
import { normalizeUnits } from './normalizeUnits';

export const multiplyExponent = (myUnits: Unit[], by: number): Unit[] | null =>
  normalizeUnits(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits) {
        try {
          u.exp = u.exp.mul(N(by));
        } catch (err) {
          const error = new Error(
            `error multiplying ${u.exp} by ${by}: ${(err as Error).message}`
          );
          throw error;
        }
      }
    })
  );
