import { getDefined } from '@decipad/utils';
import { Unit } from '@decipad/language-units';
import { getSpecificity } from './getSpecificity';
import { cmpSpecificities } from './cmpSpecificities';

export const sortSpecificities = (specificities: (Unit.Unit | string)[]) => {
  const uniqueSpecificities = Array.from(
    new Set(specificities.map((s) => getSpecificity(s)))
  );
  return uniqueSpecificities.sort((a, b) => cmpSpecificities(a, b));
};

export const getHighestSpecificity = (specificities: Unit.Unit[]) =>
  getDefined(sortSpecificities(specificities).pop());
