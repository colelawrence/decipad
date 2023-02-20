import { identity } from '../utils';
import type { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'mole',
    baseQuantity: 'substance',
    symbols: ['mol'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
