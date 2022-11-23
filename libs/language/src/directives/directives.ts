import type { Directive } from './types';
import { as } from './as-directive';
import { over } from './over-directive';
import { of } from './of-directive';

export const directives: Record<string, Directive> = {
  as,
  over,
  of,
};
