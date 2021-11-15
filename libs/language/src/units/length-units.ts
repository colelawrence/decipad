import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const baseUnit = 'meter';

export const units: UnitOfMeasure[] = [
  {
    name: 'meter',
    abbreviations: ['m', 'metre'],
    baseQuantity: 'length',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'inch',
    baseQuantity: 'length',
    toBaseQuantity: (inches) => inches.div(39.3701),
    fromBaseQuantity: (meters) => meters.mul(39.3701),
  },
  {
    name: 'angstrom',
    baseQuantity: 'length',
    toBaseQuantity: (angstroms) => angstroms.div(1e10),
    fromBaseQuantity: (meters) => meters.mul(1e10),
  },
  {
    name: 'mile',
    baseQuantity: 'length',
    toBaseQuantity: (miles) => miles.mul(1609),
    fromBaseQuantity: (meters) => meters.div(1609),
  },
];
