import Fraction from '@decipad/fraction';
import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

export const oneInch = new Fraction(254, 10_000);
export const oneFoot = oneInch.mul(12);
export const oneYard = oneFoot.mul(3);
export const oneMile = oneYard.mul(1_760);

type Converter = UnitOfMeasure['toBaseQuantity'];

const mile: Converter = (x) => x.mul(oneMile).div(1000);
const knot: Converter = (x) => x.mul(1_852).div(1000);

export const units: UnitOfMeasure[] = [
  {
    name: 'kph',
    baseQuantity: 'speed',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'mph',
    baseQuantity: 'speed',
    toBaseQuantity: mile,
    fromBaseQuantity: invert(mile),
  },
  {
    name: 'knot',
    baseQuantity: 'speed',
    toBaseQuantity: knot,
    fromBaseQuantity: invert(knot),
  },
];
