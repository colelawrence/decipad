import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { identity } from '@decipad/utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'newton',
    symbols: ['n'],
    pretty: 'N',
    baseQuantity: 'force',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
