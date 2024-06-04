import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';

export const units: UnitOfMeasure[] = [
  {
    name: 'siemens',
    baseQuantity: 'electrical conductance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
