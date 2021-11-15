import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const baseUnit = 'bit';

export const units: UnitOfMeasure[] = [
  {
    name: 'byte',
    baseQuantity: 'information',
    toBaseQuantity: (byte) => byte.mul(8),
    fromBaseQuantity: (bits) => bits.div(8).ceil(),
  },
  {
    name: 'bit',
    baseQuantity: 'information',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
