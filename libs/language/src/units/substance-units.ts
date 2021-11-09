import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'mole';

export const units: UnitOfMeasure[] = [
  {
    name: 'mole',
    baseQuantity: 'substance',
    abbreviations: ['mol'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
