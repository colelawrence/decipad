import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'ampere',
    abbreviations: ['amp'],
    baseQuantity: 'electric current',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
