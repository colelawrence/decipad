import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'ohm',
    abbreviations: ['Ω'],
    baseQuantity: 'electrical resistance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
