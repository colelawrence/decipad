import type { DirectiveImpl } from './types';
import { as } from './as-directive';
import { over } from './over-directive';
import { select } from './select-directive';
import { of } from './of-directive';

export const directives: Record<string, DirectiveImpl> = {
  as,
  over,
  select,
  of,
};
