import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

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
    abbreviations: ['in'],
    baseQuantity: 'length',
    toBaseQuantity: (inches) => inches.div(39.3701),
    fromBaseQuantity: (meters) => meters.mul(39.3701),
  },
  {
    name: 'foot',
    abbreviations: ['ft'],
    baseQuantity: 'length',
    toBaseQuantity: (inches) => inches.div(3.281),
    fromBaseQuantity: (meters) => meters.mul(3.281),
  },
  {
    name: 'yard',
    abbreviations: ['yd'],
    baseQuantity: 'length',
    toBaseQuantity: (yards) => yards.mul(0.9144),
    fromBaseQuantity: (meters) => meters.div(0.9144),
  },
  {
    name: 'furlong',
    baseQuantity: 'length',
    toBaseQuantity: (furlongs) => furlongs.mul(201.168),
    fromBaseQuantity: (furlongs) => furlongs.div(201.168),
  },
  {
    name: 'mile',
    abbreviations: ['mi'],
    baseQuantity: 'length',
    toBaseQuantity: (miles) => miles.mul(1609),
    fromBaseQuantity: (meters) => meters.div(1609),
  },
  {
    name: 'nauticalmile',
    abbreviations: ['nmi'],
    baseQuantity: 'length',
    toBaseQuantity: (nauticalMiles) => nauticalMiles.mul(1852),
    fromBaseQuantity: (meters) => meters.div(1852),
  },
  {
    name: 'angstrom',
    baseQuantity: 'length',
    toBaseQuantity: (angstroms) => angstroms.div(1e10),
    fromBaseQuantity: (meters) => meters.mul(1e10),
  },
  {
    name: 'smoot',
    baseQuantity: 'length',
    toBaseQuantity: (smoots) => smoots.mul(1.702),
    fromBaseQuantity: (meters) => meters.div(1.702),
  },
  {
    name: 'foot',
    baseQuantity: 'length',
    abbreviations: ['ft'],
    toBaseQuantity: (feet) => feet.div(3.281),
    fromBaseQuantity: (meters) => meters.mul(3.281),
  },
];
