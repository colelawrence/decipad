import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from './known-units';

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
