import { allSpecificities } from './allSpecificities';
import { getSpecificity } from './getSpecificity';

export const cmpSpecificities = (left: string, right: string): number => {
  const leftIdx = allSpecificities.indexOf(getSpecificity(left));
  const rightIdx = allSpecificities.indexOf(getSpecificity(right));

  return Math.sign(leftIdx - rightIdx);
};
