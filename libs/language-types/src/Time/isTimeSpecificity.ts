import type { Specificity } from './Time';
import { allSpecificities } from './allSpecificities';

export const isTimeSpecificity = (thing: unknown): thing is Specificity =>
  typeof thing === 'string' && allSpecificities.includes(thing);
