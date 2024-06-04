import type { UnitOfMeasure } from '@decipad/language-interfaces';
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
