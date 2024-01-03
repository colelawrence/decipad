import { Unit } from '@decipad/language-units';
// eslint-disable-next-line no-restricted-imports
import { singular } from '@decipad/language-utils';
import { Specificity } from './Time';
import { allSpecificities } from './allSpecificities';

export const getSpecificity = (thing?: string | Unit.Unit): Specificity => {
  let unit = typeof thing === 'string' ? thing : thing && thing.unit;
  if (unit) {
    unit = singular(unit);
    if (unit === 'undefined') return 'undefined';
    if (unit === 'millennium') return 'year';
    if (unit === 'century') return 'year';
    if (unit === 'decade') return 'year';
    if (unit === 'week') return 'day';

    if (allSpecificities.includes(unit as Specificity)) {
      return unit as Specificity;
    }
  } else {
    return 'undefined';
  }

  throw new Error(`panic: Expected Time.JSDateUnit, got ${unit}`);
};
