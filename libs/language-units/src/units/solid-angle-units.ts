import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { identity } from '@decipad/utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'steradian',
    symbols: ['sr'],
    baseQuantity: 'solid angle',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
