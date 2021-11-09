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
    toBaseQuantity: (inches) => inches / 39.3701,
    fromBaseQuantity: (meters) => meters * 39.3701,
  },
  {
    name: 'angstrom',
    baseQuantity: 'length',
    toBaseQuantity: (angstroms) => angstroms * 1e-10,
    fromBaseQuantity: (meters) => meters / 1e-10,
  },
  {
    name: 'mile',
    baseQuantity: 'length',
    toBaseQuantity: (miles) => miles * 1609,
    fromBaseQuantity: (meters) => meters / 1609,
  },
  {
    name: 'kilometer',
    abbreviations: ['km', 'kilometre'],
    baseQuantity: 'length',
    toBaseQuantity: (kms) => kms * 1000,
    fromBaseQuantity: (meters) => meters / 1000,
  },
];
