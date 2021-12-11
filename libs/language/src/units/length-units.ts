import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

export const oneInch = 0.0254;
export const oneFoot = 12 * oneInch;
export const oneYard = 3 * oneFoot;
export const oneMile = 1_760 * oneYard;
const oneLightsecond = 299_792_458;

type Converter = UnitOfMeasure['toBaseQuantity'];

const inch: Converter = (x) => x.mul(oneInch);
const foot: Converter = (x) => x.mul(oneFoot);
const yard: Converter = (x) => x.mul(oneYard);
const furlong: Converter = (x) => x.mul(201_168).div(1e3);
const mile: Converter = (x) => x.mul(oneMile);
const nauticalmile: Converter = (x) => x.mul(1_852);
const nauticalleague: Converter = (x) => x.mul(5_556);
const angstrom: Converter = (x) => x.div(1e10);
const bohr: Converter = (x) => x.mul(529_177_210_903).div(1e21);
const attometre: Converter = (x) => x.div(1e18);
const fermi: Converter = (x) => x.div(1e15);
const smoot: Converter = (x) => x.mul(1_702).div(1e3);
const astronomicalunit: Converter = (x) => x.mul(149_597_870_700);
const lightsecond: Converter = (x) => x.mul(oneLightsecond);
const lightminute: Converter = (x) => lightsecond(x).mul(60);
const lighthour: Converter = (x) => lightminute(x).mul(60);
const lightday: Converter = (x) => lighthour(x).mul(24);
const lightyear: Converter = (x) => x.mul(9_460_730_472_580_800);
const chain: Converter = (x) => x.mul(oneFoot).mul(66);
const fathom: Converter = (x) => x.mul(oneFoot).mul(6);
const link: Converter = (x) => x.mul(oneFoot).mul(66).div(1e2);
const marathon: Converter = (x) => x.mul(42_195);
const parsec: Converter = (x) => x.mul(30_856_775_814_913_673);
const point: Converter = (x) => x.mul(oneInch).div(72_272).mul(1e3);
const twip: Converter = (x) => x.mul(oneInch).div(1_440);
const rope: Converter = (x) => x.mul(6_096).div(1e3);
const rod: Converter = (x) => x.mul(50_292).div(1e4);
const league: Converter = (x) => x.mul(4_828);
const hand: Converter = (x) => x.mul(1_016).div(1e4);
const pica: Converter = (x) => x.mul(12).mul(oneInch).div(72_272).mul(1e3);

export const units: UnitOfMeasure[] = [
  {
    name: 'meter',
    abbreviations: ['m', 'metre'],
    baseQuantity: 'length',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.0254 m
    name: 'inch',
    abbreviations: ['in'],
    baseQuantity: 'length',
    toBaseQuantity: inch,
    fromBaseQuantity: invert(inch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.3048 m
    name: 'foot',
    baseQuantity: 'length',
    abbreviations: ['ft'],
    toBaseQuantity: foot,
    fromBaseQuantity: invert(foot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.9144 m
    name: 'yard',
    abbreviations: ['yd'],
    baseQuantity: 'length',
    toBaseQuantity: yard,
    fromBaseQuantity: invert(yard),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 201.168 m
    name: 'furlong',
    abbreviations: ['fur'],
    baseQuantity: 'length',
    toBaseQuantity: furlong,
    fromBaseQuantity: invert(furlong),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1609.344 m
    name: 'mile',
    abbreviations: ['mi'],
    baseQuantity: 'length',
    toBaseQuantity: mile,
    fromBaseQuantity: invert(mile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1852 m
    name: 'nauticalmile',
    abbreviations: ['nmi'],
    baseQuantity: 'length',
    toBaseQuantity: nauticalmile,
    fromBaseQuantity: invert(nauticalmile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 5556 m
    name: 'nauticalleague',
    abbreviations: ['nl'],
    baseQuantity: 'length',
    toBaseQuantity: nauticalleague,
    fromBaseQuantity: invert(nauticalleague),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.1 nm
    name: 'angstrom',
    baseQuantity: 'length',
    abbreviations: ['Å'],
    pretty: (n) => `${n} Å`,
    toBaseQuantity: angstrom,
    fromBaseQuantity: invert(angstrom),
  },
  {
    // https://physics.nist.gov/cgi-bin/cuu/Value?bohrrada0
    // ≈ 5.29177210903 x 10e-11 m
    name: 'bohr',
    abbreviations: ['a0', 'a₀'],
    pretty: (n) => `${n} a₀`,
    baseQuantity: 'length',
    toBaseQuantity: bohr,
    fromBaseQuantity: invert(bohr),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1×10e−18 m
    name: 'attometre',
    baseQuantity: 'length',
    abbreviations: ['am'],
    toBaseQuantity: attometre,
    fromBaseQuantity: invert(attometre),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1×10e−15 m
    name: 'fermi',
    baseQuantity: 'length',
    abbreviations: ['fm'],
    toBaseQuantity: fermi,
    fromBaseQuantity: invert(fermi),
  },
  {
    // https://en.wikipedia.org/wiki/Smoot
    // 1.702 m
    name: 'smoot',
    baseQuantity: 'length',
    toBaseQuantity: smoot,
    fromBaseQuantity: invert(smoot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 149597870700 m
    name: 'astronomicalunit',
    abbreviations: ['au'],
    baseQuantity: 'length',
    toBaseQuantity: astronomicalunit,
    fromBaseQuantity: invert(astronomicalunit),
  },
  {
    // https://en.wikipedia.org/wiki/Light-second
    // ≡ 299792458 m
    name: 'lightsecond',
    abbreviations: ['ls'],
    baseQuantity: 'length',
    toBaseQuantity: lightsecond,
    fromBaseQuantity: invert(lightsecond),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 60 light-seconds
    name: 'lightminute',
    baseQuantity: 'length',
    toBaseQuantity: lightminute,
    fromBaseQuantity: invert(lightminute),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 60 light-minutes
    name: 'lighthour',
    abbreviations: ['lh'],
    baseQuantity: 'length',
    toBaseQuantity: lighthour,
    fromBaseQuantity: invert(lighthour),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 24 light-hours
    name: 'lightday',
    abbreviations: ['ld'],
    baseQuantity: 'length',
    toBaseQuantity: lightday,
    fromBaseQuantity: invert(lightday),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 9.4607304725808×10e15 m
    name: 'lightyear',
    abbreviations: ['ly'],
    baseQuantity: 'length',
    toBaseQuantity: lightyear,
    fromBaseQuantity: invert(lightyear),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≈ 20.11684 m
    // ≡ 66 ft (US) ≡ 4 rods
    name: 'chain',
    baseQuantity: 'length',
    abbreviations: ['ch'],
    toBaseQuantity: chain,
    fromBaseQuantity: invert(chain),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 1.8288 m
    // ≡ 6 ft (US)
    name: 'fathom',
    baseQuantity: 'length',
    abbreviations: ['ftm'],
    toBaseQuantity: fathom,
    fromBaseQuantity: invert(fathom),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1⁄100 ch ≡ 0.66 ft (US) ≡ 7.92 in
    // ≈ 0.2011684 m
    name: 'link',
    baseQuantity: 'length',
    abbreviations: ['lnk'],
    toBaseQuantity: link,
    fromBaseQuantity: invert(link),
  },
  {
    // https://en.wikipedia.org/wiki/Marathon
    // ≡ 42195 m
    name: 'marathon',
    baseQuantity: 'length',
    toBaseQuantity: marathon,
    fromBaseQuantity: invert(marathon),
  },
  {
    // https://en.wikipedia.org/wiki/Parsec
    // ≈ 30856775814913673 m
    name: 'parsec',
    baseQuantity: 'length',
    abbreviations: ['pc'],
    toBaseQuantity: parsec,
    fromBaseQuantity: invert(parsec),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≈ 0.000351450 m
    // ≡ 1⁄72.272 in
    name: 'point',
    baseQuantity: 'length',
    abbreviations: ['pt'],
    toBaseQuantity: point,
    fromBaseQuantity: invert(point),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 1.7638×10−5 m
    // ≡ 1⁄1440 in
    name: 'twip',
    baseQuantity: 'length',
    abbreviations: ['twp'],
    toBaseQuantity: twip,
    fromBaseQuantity: invert(twip),
  },
  {
    // https://en.wikipedia.org/wiki/Rope_(unit)
    // = 6.096 m
    // ≡ 20 ft (US)
    name: 'rope',
    baseQuantity: 'length',
    toBaseQuantity: rope,
    fromBaseQuantity: invert(rope),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 5.0292 m
    name: 'rod',
    baseQuantity: 'length',
    abbreviations: ['rd'],
    toBaseQuantity: rod,
    fromBaseQuantity: invert(rod),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≈ 4828 m
    name: 'league',
    baseQuantity: 'length',
    abbreviations: ['lea'],
    toBaseQuantity: league,
    fromBaseQuantity: invert(league),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.1016 m
    // ≡ 4 in (US)
    name: 'hand',
    baseQuantity: 'length',
    toBaseQuantity: hand,
    fromBaseQuantity: invert(hand),
  },
  {
    // https://en.wikipedia.org/wiki/Pica_(typography)
    // ≡ 12 points
    name: 'pica',
    baseQuantity: 'length',
    toBaseQuantity: pica,
    fromBaseQuantity: invert(pica),
  },
];
