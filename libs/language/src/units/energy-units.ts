import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'joule',
    baseQuantity: 'energy',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'calorie',
    abbreviations: ['cal'],
    baseQuantity: 'energy',
    toBaseQuantity: (calories) => calories.mul(4184).div(1000),
    fromBaseQuantity: (joules) => joules.div(4184).mul(1000),
  },
];
