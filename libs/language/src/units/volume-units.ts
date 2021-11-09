import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'cubicmeter';

export const units: UnitOfMeasure[] = [
  {
    name: 'cubicmeter',
    baseQuantity: 'volume',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'liter',
    baseQuantity: 'volume',
    toBaseQuantity: (liters) => liters / 1000,
    fromBaseQuantity: (meters) => meters * 1000,
  },
];
