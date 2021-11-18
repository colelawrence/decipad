import type { Directive } from './types';
import { as } from './as-directive';
import { over } from './over-directive';
import { select } from './select-directive';

export const directives: Record<string, Directive> = {
  as,
  over,
  select,
};
