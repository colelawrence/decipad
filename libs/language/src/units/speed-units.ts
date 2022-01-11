import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

export const oneInch = 0.0254;
export const oneFoot = 12 * oneInch;
export const oneYard = 3 * oneFoot;
export const oneMile = 1_760 * oneYard;

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
