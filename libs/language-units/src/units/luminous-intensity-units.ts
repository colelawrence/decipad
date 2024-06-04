import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { identity } from '@decipad/utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'candela',
    symbols: ['ca'],
    baseQuantity: 'luminous intensity',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
