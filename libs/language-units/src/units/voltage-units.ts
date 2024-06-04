import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { identity } from '@decipad/utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'volt',
    symbols: ['v'],
    pretty: 'V',
    baseQuantity: 'voltage',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
