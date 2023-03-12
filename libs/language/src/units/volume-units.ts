import { N } from '@decipad/number';
import { identity, invert } from '../utils';
import type { UnitOfMeasure } from './known-units';
import { oneMile, oneYard, oneFoot, oneInch } from './length-units';

const oneGallon = N(454_609);

type Converter = UnitOfMeasure['toBaseQuantity'];

const liters: Converter = (x) => x.div(N(1_000));
const ton: Converter = (x) => x.mul(N(99_108_963_072)).div(N(1e11));
const cup: Converter = (x) => x.mul(N(250)).div(N(1_000_000));
const tablespoon: Converter = (x) => x.mul(N(15)).div(N(1_000_000));
const ounce: Converter = (x) => x.mul(N(284_130_625)).div(N(1e13));
const pint: Converter = (x) => x.mul(N(56_826_125)).div(N(1e11));
const teaspoon: Converter = (x) => x.mul(N(5)).div(N(1_000_000));
const pinch: Converter = (x) => x.mul(N(5)).div(N(1_000_000)).div(N(16));
const dash: Converter = (x) =>
  x.mul(N(5)).div(N(1_000_000)).div(N(16)).div(N(2));
const barrel: Converter = (x) => x.mul(N(16_365_924)).div(N(1e8));
const gallon: Converter = (x) => x.mul(N(oneGallon)).div(N(1e8));
const bushel: Converter = (x) => x.mul(N(oneGallon)).div(N(1e8)).mul(N(8));
const bucket: Converter = (x) => x.mul(oneGallon).div(N(1e8)).mul(N(4));
const acrefoot: Converter = (x) => x.mul(N(123_348_183_754_752)).div(N(1e14));
const cubicinch: Converter = (x) => x.mul(oneInch).mul(oneInch).mul(oneInch);
const cubicfoot: Converter = (x) => x.mul(oneFoot).mul(oneFoot).mul(oneFoot);
const cubicyard: Converter = (x) => x.mul(oneYard).mul(oneYard).mul(oneYard);
const cubicmile: Converter = (x) => x.mul(oneMile).mul(oneMile).mul(oneMile);
const cubiccentimeter: Converter = (x) => x.div(N(1e6));

export const units: UnitOfMeasure[] = [
  {
    name: 'cubicmeter',
    baseQuantity: 'volume',
    symbols: ['m3', 'm³'],
    aliases: ['cubicmetre'],
    pretty: 'm³',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'cubiccentimeter',
    baseQuantity: 'volume',
    symbols: ['cm3', 'cm³'],
    aliases: ['cubiccentimetre'],
    pretty: 'cm³',
    toBaseQuantity: cubiccentimeter,
    fromBaseQuantity: invert(cubiccentimeter),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1 in * 1 in * 1 in
    name: 'cubicinch',
    baseQuantity: 'volume',
    symbols: ['in3', 'in³', 'cuin'],
    pretty: 'in³',
    toBaseQuantity: cubicinch,
    fromBaseQuantity: invert(cubicinch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1 ft * 1 ft * 1 ft
    name: 'cubicfoot',
    baseQuantity: 'volume',
    symbols: ['ft3', 'ft³', 'cuft'],
    pretty: 'ft³',
    toBaseQuantity: cubicfoot,
    fromBaseQuantity: invert(cubicfoot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1 yd * 1 yd * 1 yd
    name: 'cubicyd',
    baseQuantity: 'volume',
    symbols: ['yd3', 'yd³', 'cuyd'],
    pretty: 'yd³',
    toBaseQuantity: cubicyard,
    fromBaseQuantity: invert(cubicyard),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1 mi * 1 mi * 1 mi
    name: 'cubicmile',
    baseQuantity: 'volume',
    symbols: ['cumi'],
    pretty: 'cu mi',
    toBaseQuantity: cubicmile,
    fromBaseQuantity: invert(cubicmile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.001 m3
    name: 'liter',
    baseQuantity: 'volume',
    symbols: ['l'],
    aliases: ['litre'],
    toBaseQuantity: liters,
    fromBaseQuantity: invert(liters),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.99108963072 m3
    name: 'ton_displacement',
    baseQuantity: 'volume',
    toBaseQuantity: ton,
    fromBaseQuantity: invert(ton),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡  250.0×10−6 m3
    name: 'cup',
    baseQuantity: 'volume',
    toBaseQuantity: cup,
    fromBaseQuantity: invert(cup),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡  15×10−6 m3
    name: 'tablespoon',
    baseQuantity: 'volume',
    symbols: ['tbsp'],
    toBaseQuantity: tablespoon,
    fromBaseQuantity: invert(tablespoon),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 28.4130625×10e−6 m3
    name: 'ounce_fluid_imperial',
    baseQuantity: 'volume',
    symbols: ['floz'],
    toBaseQuantity: ounce,
    fromBaseQuantity: invert(ounce),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 568.26125×10−6 m3
    name: 'pint',
    baseQuantity: 'volume',
    toBaseQuantity: pint,
    fromBaseQuantity: invert(pint),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡  5×10−6 m3
    name: 'teaspoon',
    baseQuantity: 'volume',
    symbols: ['tsp'],
    toBaseQuantity: teaspoon,
    fromBaseQuantity: invert(teaspoon),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1/16 tsp
    name: 'pinch',
    baseQuantity: 'volume',
    toBaseQuantity: pinch,
    fromBaseQuantity: invert(pinch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1/2 pinch
    name: 'dash',
    baseQuantity: 'volume',
    toBaseQuantity: dash,
    fromBaseQuantity: invert(dash),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 0.16365924 m3
    name: 'barrel',
    baseQuantity: 'volume',
    symbols: ['bl'],
    toBaseQuantity: barrel,
    fromBaseQuantity: invert(barrel),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 4.54609×10−3 m3
    name: 'gallon',
    baseQuantity: 'volume',
    symbols: ['gal'],
    toBaseQuantity: gallon,
    fromBaseQuantity: invert(gallon),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 8 gal
    name: 'bushel',
    baseQuantity: 'volume',
    symbols: ['bu'],
    toBaseQuantity: bushel,
    fromBaseQuantity: invert(bushel),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 4 gal
    name: 'bucket',
    baseQuantity: 'volume',
    symbols: ['bkt'],
    toBaseQuantity: bucket,
    fromBaseQuantity: invert(bucket),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 1233.48183754752 m3
    name: 'acrefoot',
    baseQuantity: 'volume',
    symbols: ['acft'],
    toBaseQuantity: acrefoot,
    fromBaseQuantity: invert(acrefoot),
  },
];
