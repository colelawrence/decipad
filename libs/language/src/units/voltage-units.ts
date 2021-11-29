import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'volt',
    abbreviations: ['V'],
    baseQuantity: 'voltage',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
