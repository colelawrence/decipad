import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'farad',
    abbreviations: ['F'],
    pretty: 'F',
    baseQuantity: 'electrical capacitance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
