import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'steradian',
    abbreviations: ['sr'],
    baseQuantity: 'solid angle',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
