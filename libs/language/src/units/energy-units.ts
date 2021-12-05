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
    abbreviations: ['calory'], // why?
    baseQuantity: 'energy',
    toBaseQuantity: (calories) => calories.mul(4184),
    fromBaseQuantity: (joules) => joules.div(4184),
  },
];
