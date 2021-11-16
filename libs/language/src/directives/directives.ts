import type { Directive } from './types';
import { as } from './as-directive';

export const directives: Record<string, Directive> = {
  as,
};
