import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

export const units: UnitOfMeasure[] = [
  {
    name: 'ampere',
    symbols: ['a'],
    pretty: 'A',
    baseQuantity: 'electric current',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
