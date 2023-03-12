import { N } from '@decipad/number';
import type { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';
import { oneMile, oneYard, oneFoot, oneInch } from './length-units';

const oneAcre = N(40_468_564_224);

type Converter = UnitOfMeasure['toBaseQuantity'];

const squarekilometre: Converter = (x) => x.mul(N(1_000_000));
const squarecentimeter: Converter = (x) => x.div(N(1_000_0));
const squaremile: Converter = (x) => x.mul(oneMile).mul(oneMile);
const squareyard: Converter = (x) => x.mul(oneYard).mul(oneYard);
const squarefoot: Converter = (x) => x.mul(oneFoot).mul(oneFoot);
const squareinch: Converter = (x) => x.mul(oneInch).mul(oneInch);
const acre: Converter = (x) => x.mul(oneAcre).div(N(1e7));
const barony: Converter = (x) => x.mul(oneAcre).div(N(1e7)).mul(N(4_000));
const barn: Converter = (x) => x.div(N(1e29));
const are: Converter = (x) => x.mul(N(100));
const ha: Converter = (x) => x.mul(N(10_000));

export const units: UnitOfMeasure[] = [
  {
    name: 'squaremeter',
    symbols: ['m2', 'm²'],
    pretty: 'm²',
    baseQuantity: 'area',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'squarecentimeter',
    symbols: ['cm2', 'cm²'],
    pretty: 'cm²',
    baseQuantity: 'area',
    toBaseQuantity: squarecentimeter,
    fromBaseQuantity: invert(squarecentimeter),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 10e6 m2
    name: 'squarekilometre',
    symbols: ['km2', 'km²'],
    pretty: 'km²',
    baseQuantity: 'area',
    toBaseQuantity: squarekilometre,
    fromBaseQuantity: invert(squarekilometre),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 2.589988110336×10e6 m2
    // ≡ 1 m × 1 m
    name: 'squaremile',
    symbols: ['mi2', 'mi²', 'sqmi'],
    pretty: 'mi²',
    baseQuantity: 'area',
    toBaseQuantity: squaremile,
    fromBaseQuantity: invert(squaremile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.83612736 m2
    // ≡ 1 yd × 1 yd
    name: 'squareyard',
    symbols: ['yd2', 'yd²', 'sqyd'],
    pretty: 'yd²',
    baseQuantity: 'area',
    toBaseQuantity: squareyard,
    fromBaseQuantity: invert(squareyard),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 9.290304×10e−2 m2
    // ≡ 1 ft × 1 ft
    name: 'squarefoot',
    symbols: ['ft2', 'ft²', 'sqft'],
    pretty: 'ft²',
    baseQuantity: 'area',
    toBaseQuantity: squarefoot,
    fromBaseQuantity: invert(squarefoot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 6.4516×10e−4 m2
    // ≡ 1 inch × 1 inch
    name: 'squareinch',
    symbols: ['in2', 'in²', 'sqin'],
    pretty: 'in²',
    baseQuantity: 'area',
    toBaseQuantity: squareinch,
    fromBaseQuantity: invert(squareinch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 4046.8564224 m2
    // ≡ 1 ch × 10 ch = 4840 sq yd
    name: 'acre',
    symbols: ['ac'],
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
    symbols: ['ha'],
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
    symbols: ['b'],
    baseQuantity: 'area',
    toBaseQuantity: barn,
    fromBaseQuantity: invert(barn),
  },
];
