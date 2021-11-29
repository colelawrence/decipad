import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'hertz',
    abbreviations: ['hz'],
    baseQuantity: 'frequency',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
