import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const baseUnit = 'bit';

export const units: UnitOfMeasure[] = [
  {
    name: 'byte',
    baseQuantity: 'information',
    toBaseQuantity: (byte) => byte * 8,
    fromBaseQuantity: (bits) => Math.ceil(bits / 8),
  },
  {
    name: 'bit',
    baseQuantity: 'information',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
