import type { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'candela',
    symbols: ['ca'],
    baseQuantity: 'luminous intensity',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
