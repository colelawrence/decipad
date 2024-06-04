import type { DeciNumberBase } from '@decipad/number';
import { N } from '@decipad/number';
import { identity } from '@decipad/utils';
import type { UnitOfMeasure } from '@decipad/language-interfaces';
import { invert } from '../utils/invert';

const PI = N(3141592653589793, 10 ** 15);

const degreeToRadian = (deg: DeciNumberBase): DeciNumberBase =>
  deg.mul(PI).div(N(180));

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
