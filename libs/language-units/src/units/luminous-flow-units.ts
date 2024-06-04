import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { identity } from '@decipad/utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'lumen',
    symbols: ['lm'],
    baseQuantity: 'luminous flow',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
