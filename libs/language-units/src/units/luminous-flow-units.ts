import type { UnitOfMeasure } from './known-units';
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
