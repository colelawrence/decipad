import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const baseUnit = 'joule';

export const units: UnitOfMeasure[] = [
  {
    name: 'joule',
    baseQuantity: 'energy',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'calorie',
    abbreviations: ['calory'],
    baseQuantity: 'energy',
    toBaseQuantity: (calories) => calories * 4184,
    fromBaseQuantity: (joules) => joules / 4184,
  },
];
