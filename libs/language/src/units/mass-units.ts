import { N } from '@decipad/number';
import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

const N16 = N(16);
const N26 = N(26);
const N_1E4 = N(1e4);
const N_1_000_000 = N(1_000_000);
const N1E9 = N(1e9);
const N_28_349_523_125 = N(28_349_523_125);
const N_10_160_469_088 = N(10_160_469_088);

type Converter = UnitOfMeasure['toBaseQuantity'];
const pound: Converter = (x) => x.mul(N_28_349_523_125).div(N1E9).mul(N16);
const ounce: Converter = (x) => x.mul(N_28_349_523_125).div(N1E9);
const tonne: Converter = (x) => x.mul(N_1_000_000);
const oz: Converter = (x) => x.mul(N26);
const ton: Converter = (x) => x.mul(N_10_160_469_088).div(N_1E4);

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
