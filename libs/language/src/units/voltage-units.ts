import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'volt',
    symbols: ['V'],
    baseQuantity: 'voltage',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
