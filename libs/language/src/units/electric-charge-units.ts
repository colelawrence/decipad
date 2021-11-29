import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'coulomb',
    abbreviations: ['C'],
    baseQuantity: 'electric charge',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
