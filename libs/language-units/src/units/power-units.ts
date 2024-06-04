import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

export const units: UnitOfMeasure[] = [
  {
    name: 'watt',
    symbols: ['w', 'va'],
    baseQuantity: 'power',
    pretty: 'W',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
