import Fraction from '@decipad/fraction';
import { identity, invert } from '../utils';
import { UnitOfMeasure } from './known-units';

const degreeToRadian = (deg: Fraction): Fraction => deg.mul(Math.PI).div(180);

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
