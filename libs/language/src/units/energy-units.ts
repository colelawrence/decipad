import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const calorie: Converter = (x) => x.mul(4184).div(1000);

export const units: UnitOfMeasure[] = [
  {
    name: 'joule',
    abbreviations: ['j'],
    baseQuantity: 'energy',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'calorie',
    abbreviations: ['cal'],
    baseQuantity: 'energy',
    toBaseQuantity: calorie,
    fromBaseQuantity: invert(calorie),
  },
];
