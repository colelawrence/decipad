import { singular } from '@decipad/language-units';
import type { Unit } from '@decipad/language-interfaces';
import type { Specificity } from './Time';
import { allSpecificities } from './allSpecificities';

export const getSpecificity = (thing?: string | Unit): Specificity => {
  let unit = typeof thing === 'string' ? thing : thing && thing.unit;
  if (unit) {
    unit = singular(unit);
    if (unit === 'undefined') return 'undefined';
    if (unit === 'millennium') return 'year';
    if (unit === 'century') return 'year';
    if (unit === 'decade') return 'year';

    if (allSpecificities.includes(unit as Specificity)) {
      return unit as Specificity;
    }
  } else {
    return 'undefined';
  }

  throw new Error(`panic: Expected Time.JSDateUnit, got ${unit}`);
};
