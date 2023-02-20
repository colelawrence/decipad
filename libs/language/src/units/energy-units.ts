import { N } from '@decipad/number';
import type { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const calorie: Converter = (x) => x.mul(N(4184)).div(N(1000));
const wh: Converter = (x) => x.mul(N(3_600));

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
  {
    name: 'watthour',
    symbols: ['wh'],
    pretty: 'Wh',
    baseQuantity: 'energy',
    toBaseQuantity: wh,
    fromBaseQuantity: invert(wh),
  },
];
