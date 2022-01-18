import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'farad',
    symbols: ['F'],
    pretty: 'F',
    baseQuantity: 'electrical capacitance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
