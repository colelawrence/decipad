import { getDefined } from '@decipad/utils';
import type { Unit } from '@decipad/language-interfaces';
import { getSpecificity } from './getSpecificity';
import { cmpSpecificities } from './cmpSpecificities';

export const sortSpecificities = (specificities: (Unit | string)[]) => {
  const uniqueSpecificities = Array.from(
    new Set(specificities.map((s) => getSpecificity(s)))
  );
  return uniqueSpecificities.sort((a, b) => cmpSpecificities(a, b));
};

export const getHighestSpecificity = (specificities: Unit[]) =>
  getDefined(sortSpecificities(specificities).pop());
