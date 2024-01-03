import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'farad',
    symbols: ['f'],
    pretty: 'F',
    baseQuantity: 'electrical capacitance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
