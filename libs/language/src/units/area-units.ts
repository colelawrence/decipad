import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';
import { oneMile, oneYard, oneFoot, oneInch } from './length-units';

const oneAcre = 40_468_564_224;

type Converter = UnitOfMeasure['toBaseQuantity'];

const squarekilometre: Converter = (x) => x.mul(1_000_000);
const squaremile: Converter = (x) => x.mul(oneMile).mul(oneMile);
const squareyard: Converter = (x) => x.mul(oneYard).mul(oneYard);
const squarefoot: Converter = (x) => x.mul(oneFoot).mul(oneFoot);
const squareinch: Converter = (x) => x.mul(oneInch).mul(oneInch);
const acre: Converter = (x) => x.mul(oneAcre).div(1e7);
const barony: Converter = (x) => x.mul(oneAcre).div(1e7).mul(4_000);
const barn: Converter = (x) => x.div(1e29);
const are: Converter = (x) => x.mul(100);
const ha: Converter = (x) => x.mul(10_000);

export const units: UnitOfMeasure[] = [
  {
    name: 'squaremeter',
    abbreviations: ['m2', 'm²'],
    pretty: (n) => `${n} m²`,
    baseQuantity: 'area',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 10e6 m2
    name: 'squarekilometre',
    abbreviations: ['km2', 'km²'],
    pretty: (n) => `${n} km²`,
    baseQuantity: 'area',
    toBaseQuantity: squarekilometre,
    fromBaseQuantity: invert(squarekilometre),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 2.589988110336×10e6 m2
    // ≡ 1 m × 1 m
    name: 'squaremile',
    abbreviations: ['sqmi'],
    pretty: (n) => `${n} sq mi`,
    baseQuantity: 'area',
    toBaseQuantity: squaremile,
    fromBaseQuantity: invert(squaremile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.83612736 m2
    // ≡ 1 yd × 1 yd
    name: 'squareyard',
    abbreviations: ['sqyd'],
    pretty: (n) => `${n} sq yd`,
    baseQuantity: 'area',
    toBaseQuantity: squareyard,
    fromBaseQuantity: invert(squareyard),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 9.290304×10e−2 m2
    // ≡ 1 ft × 1 ft
    name: 'squarefoot',
    abbreviations: ['sqft'],
    pretty: (n) => `${n} sq ft`,
    baseQuantity: 'area',
    toBaseQuantity: squarefoot,
    fromBaseQuantity: invert(squarefoot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 6.4516×10e−4 m2
    // ≡ 1 inch × 1 inch
    name: 'squareinch',
    abbreviations: ['sqin'],
    pretty: (n) => `${n} sq in`,
    baseQuantity: 'area',
    toBaseQuantity: squareinch,
    fromBaseQuantity: invert(squareinch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 4046.8564224 m2
    // ≡ 1 ch × 10 ch = 4840 sq yd
    name: 'acre',
    abbreviations: ['ac'],
    baseQuantity: 'area',
    toBaseQuantity: acre,
    fromBaseQuantity: invert(acre),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 100 m2
    name: 'are',
    baseQuantity: 'area',
    toBaseQuantity: are,
    fromBaseQuantity: invert(are),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 10000 m2
    name: 'hectare',
    abbreviations: ['ha'],
    baseQuantity: 'area',
    toBaseQuantity: ha,
    fromBaseQuantity: invert(ha),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1.61874256896×107 m2
    // ≡ 4000 ac
    name: 'barony',
    baseQuantity: 'area',
    toBaseQuantity: barony,
    fromBaseQuantity: invert(barony),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 10e−28 m2
    name: 'barn',
    abbreviations: ['b'],
    baseQuantity: 'area',
    toBaseQuantity: barn,
    fromBaseQuantity: invert(barn),
  },
];
