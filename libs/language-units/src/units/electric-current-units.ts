import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from './known-units';

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
