import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'hertz',
    symbols: ['hz'],
    pretty: 'Hz',
    baseQuantity: 'frequency',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
