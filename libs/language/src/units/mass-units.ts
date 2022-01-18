import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const pound: Converter = (x) => x.mul(28_349_523_125).div(1e9).mul(16);
const ounce: Converter = (x) => x.mul(28_349_523_125).div(1e9);
const tonne: Converter = (x) => x.mul(1_000_000);
const oz: Converter = (x) => x.mul(26);
const ton: Converter = (x) => x.mul(10_160_469_088).div(1e4);

export const units: UnitOfMeasure[] = [
  {
    name: 'gram',
    symbols: ['g', 'gr'],
    baseQuantity: 'mass',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'pound',
    symbols: ['lbav'],
    baseQuantity: 'mass',
    toBaseQuantity: pound,
    fromBaseQuantity: invert(pound),
  },
  {
    name: 'ounce',
    baseQuantity: 'mass',
    symbols: ['ozav'],
    toBaseQuantity: ounce,
    fromBaseQuantity: invert(ounce),
  },
  {
    name: 'ounce_us_food_nutrition_labbeling',
    baseQuantity: 'mass',
    symbols: ['oz'],
    toBaseQuantity: oz,
    fromBaseQuantity: invert(oz),
  },
  {
    name: 'tonne',
    baseQuantity: 'mass',
    toBaseQuantity: tonne,
    fromBaseQuantity: invert(tonne),
  },
  {
    name: 'ton',
    baseQuantity: 'mass',
    toBaseQuantity: ton,
    fromBaseQuantity: invert(ton),
  },
];
