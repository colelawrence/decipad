import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'siemen',
    baseQuantity: 'electrical conductance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
