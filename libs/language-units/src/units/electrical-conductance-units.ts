import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'siemens',
    baseQuantity: 'electrical conductance',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
