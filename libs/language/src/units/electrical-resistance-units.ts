import type { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'ohm',
    symbols: ['Ω'],
    pretty: 'Ω',
    baseQuantity: 'electrical resistance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
