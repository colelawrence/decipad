import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'coulomb',
    abbreviations: ['C'],
    pretty: 'C',
    baseQuantity: 'electric charge',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
