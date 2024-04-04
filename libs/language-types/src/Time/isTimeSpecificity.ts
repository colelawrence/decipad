import type { Specificity } from './Time';
import { allSpecificities } from './allSpecificities';

export const isTimeSpecificity = (thing: string): thing is Specificity =>
  allSpecificities.includes(thing);
