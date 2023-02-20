import { N } from '@decipad/number';
import type { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

export const oneInch = N(254, 10_000);
export const oneFoot = oneInch.mul(N(12));
export const oneYard = oneFoot.mul(N(3));
export const oneMile = oneYard.mul(N(1_760));
const N_1000 = N(1000);

type Converter = UnitOfMeasure['toBaseQuantity'];

const mile: Converter = (x) => x.mul(oneMile).div(N_1000);
const knot: Converter = (x) => x.mul(N(1_852)).div(N_1000);

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
