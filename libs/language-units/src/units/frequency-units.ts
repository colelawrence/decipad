import type { UnitOfMeasure } from './known-units';
import { identity } from '@decipad/utils';

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
