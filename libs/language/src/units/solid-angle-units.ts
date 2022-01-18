import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'steradian',
    symbols: ['sr'],
    baseQuantity: 'solid angle',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
