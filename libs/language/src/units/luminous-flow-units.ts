import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'lumen',
    abbreviations: ['lm'],
    baseQuantity: 'luminous flow',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
