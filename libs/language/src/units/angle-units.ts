import DeciNumber, { N } from '@decipad/number';
import { identity, invert } from '../utils';
import type { UnitOfMeasure } from './known-units';

const PI = N(3141592653589793, 10 ** 15);

const degreeToRadian = (deg: DeciNumber): DeciNumber => deg.mul(PI).div(N(180));

export const units: UnitOfMeasure[] = [
  {
    name: 'radian',
    symbols: ['r', 'rad'],
    pretty: 'rad',
    baseQuantity: 'angle',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'degree',
    symbols: ['°'],
    pretty: '°',
    baseQuantity: 'angle',
    toBaseQuantity: degreeToRadian,
    fromBaseQuantity: invert(degreeToRadian),
  },
];
