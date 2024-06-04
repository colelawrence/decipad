import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

export const units: UnitOfMeasure[] = [
  {
    name: 'coulomb',
    symbols: ['c'],
    pretty: 'C',
    baseQuantity: 'electric charge',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
