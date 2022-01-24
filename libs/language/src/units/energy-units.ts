import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const calorie: Converter = (x) => x.mul(4184).div(1000);

export const units: UnitOfMeasure[] = [
  {
    name: 'joule',
    symbols: ['j'],
    pretty: 'J',
    baseQuantity: 'energy',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'calorie',
    symbols: ['cal'],
    baseQuantity: 'energy',
    toBaseQuantity: calorie,
    fromBaseQuantity: invert(calorie),
  },
];
