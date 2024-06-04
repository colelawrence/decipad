import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

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
