import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'gram',
    abbreviations: ['g', 'gr'],
    baseQuantity: 'mass',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'pound',
    baseQuantity: 'mass',
    toBaseQuantity: (pounds) => pounds.mul(453.5925),
    fromBaseQuantity: (g) => g.div(453.5925),
  },
  {
    name: 'ounce',
    baseQuantity: 'mass',
    toBaseQuantity: (ounces) => ounces.mul(28.3495),
    fromBaseQuantity: (g) => g.div(28.3495),
  },
  {
    name: 'tonne',
    baseQuantity: 'mass',
    toBaseQuantity: (x) => x.mul(1000000),
    fromBaseQuantity: (x) => x.div(1000000),
  },
  {
    name: 'ton',
    baseQuantity: 'mass',
    toBaseQuantity: (x) => x.mul(10160469088).div(10e6),
    fromBaseQuantity: (x) => x.div(10160469088).mul(10e6),
  },
];
