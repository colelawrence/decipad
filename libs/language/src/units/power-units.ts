import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'watt';

export const units: UnitOfMeasure[] = [
  {
    name: 'watt',
    abbreviations: ['W'],
    baseQuantity: 'power',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
