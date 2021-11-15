import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'gram';

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
    name: 'ton',
    baseQuantity: 'mass',
    toBaseQuantity: (tons) => tons.mul(1000000),
    fromBaseQuantity: (g) => g.div(1000000),
  },
];
