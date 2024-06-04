import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

export const units: UnitOfMeasure[] = [
  {
    name: 'mole',
    baseQuantity: 'substance',
    symbols: ['mol'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
