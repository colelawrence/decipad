import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'bit',
    baseQuantity: 'information',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'byte',
    baseQuantity: 'information',
    doesNotScaleOnConversion: true,
    toBaseQuantity: (byte) => byte.mul(8),
    fromBaseQuantity: (bits) => bits.div(8).ceil(),
  },
];
