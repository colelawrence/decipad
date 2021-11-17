import type { Directive } from './types';
import { as } from './as-directive';
import { select } from './select-directive';

export const directives: Record<string, Directive> = {
  as,
  select,
};
