import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'watt',
    symbols: ['W'],
    baseQuantity: 'power',
    pretty: 'W',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
