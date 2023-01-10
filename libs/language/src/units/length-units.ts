import { N } from '@decipad/number';
import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

export const oneInch = N(254, 10 ** 4);
export const oneFoot = oneInch.mul(N(12));
export const oneYard = oneFoot.mul(N(3));
export const oneMile = oneYard.mul(N(1_760));
const oneFurlong = N(201_168, 1e3);
const oneNauticalmile = N(1_852);
const oneNauticalleague = N(5_556);
const oneAngstrom = N(1, 1e10);
const oneBohr = N(529_177_210_903, 1e21);
const oneAttometre = N(1, 1e18);
const oneFermi = N(1, 1e15);
const oneSmoot = N(1_702, 1e3);
const oneAstronomicalunit = N(149_597_870_700);
const oneLightsecond = N(299_792_458);
const oneLightyear = N(9_460_730_472_580_800);

type Converter = UnitOfMeasure['toBaseQuantity'];

const inch: Converter = (x) => x.mul(oneInch);
const foot: Converter = (x) => x.mul(oneFoot);
const yard: Converter = (x) => x.mul(oneYard);
const furlong: Converter = (x) => x.mul(oneFurlong);
const mile: Converter = (x) => x.mul(oneMile);
const nauticalmile: Converter = (x) => x.mul(oneNauticalmile);
const nauticalleague: Converter = (x) => x.mul(oneNauticalleague);
const angstrom: Converter = (x) => x.mul(oneAngstrom);
const bohr: Converter = (x) => x.mul(oneBohr);
const attometre: Converter = (x) => x.mul(oneAttometre);
const fermi: Converter = (x) => x.mul(oneFermi);
const smoot: Converter = (x) => x.mul(oneSmoot);
const astronomicalunit: Converter = (x) => x.mul(oneAstronomicalunit);
const lightsecond: Converter = (x) => x.mul(oneLightsecond);
const lightminute: Converter = (x) => lightsecond(x).mul(N(60));
const lighthour: Converter = (x) => lightminute(x).mul(N(60));
const lightday: Converter = (x) => lighthour(x).mul(N(24));
const lightyear: Converter = (x) => x.mul(oneLightyear);
const chain: Converter = (x) => x.mul(oneFoot).mul(N(66));
const fathom: Converter = (x) => x.mul(oneFoot).mul(N(6));
const link: Converter = (x) => x.mul(oneFoot).mul(N(66)).div(N(1e2));
const marathon: Converter = (x) => x.mul(N(42_195));
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const parsec: Converter = (x) => x.mul(N(30_856_775_814_913_673));
const point: Converter = (x) => x.mul(oneInch).div(N(72_272)).mul(N(1e3));
const twip: Converter = (x) => x.mul(oneInch).div(N(1_440));
const rope: Converter = (x) => x.mul(N(6_096)).div(N(1e3));
const rod: Converter = (x) => x.mul(N(50_292)).div(N(1e4));
const league: Converter = (x) => x.mul(N(4_828));
const hand: Converter = (x) => x.mul(N(1_016)).div(N(1e4));
const pica: Converter = (x) =>
  x.mul(N(12)).mul(oneInch).div(N(72_272)).mul(N(1e3));

export const units: UnitOfMeasure[] = [
  {
    name: 'meter',
    symbols: ['m'],
    aliases: ['metre'],
    baseQuantity: 'length',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.0254 m
    name: 'inch',
    symbols: ['in'],
    baseQuantity: 'length',
    toBaseQuantity: inch,
    fromBaseQuantity: invert(inch),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.3048 m
    name: 'foot',
    baseQuantity: 'length',
    symbols: ['ft'],
    toBaseQuantity: foot,
    fromBaseQuantity: invert(foot),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.9144 m
    name: 'yard',
    symbols: ['yd'],
    baseQuantity: 'length',
    toBaseQuantity: yard,
    fromBaseQuantity: invert(yard),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 201.168 m
    name: 'furlong',
    symbols: ['fur'],
    baseQuantity: 'length',
    toBaseQuantity: furlong,
    fromBaseQuantity: invert(furlong),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1609.344 m
    name: 'mile',
    symbols: ['mi'],
    baseQuantity: 'length',
    toBaseQuantity: mile,
    fromBaseQuantity: invert(mile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1852 m
    name: 'nauticalmile',
    symbols: ['nmi'],
    baseQuantity: 'length',
    pretty: 'nautical mile',
    toBaseQuantity: nauticalmile,
    fromBaseQuantity: invert(nauticalmile),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 5556 m
    name: 'nauticalleague',
    symbols: ['nl'],
    baseQuantity: 'length',
    pretty: 'nautical league',
    toBaseQuantity: nauticalleague,
    fromBaseQuantity: invert(nauticalleague),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 0.1 nm
    name: 'angstrom',
    baseQuantity: 'length',
    symbols: ['Å'],
    pretty: 'Å',
    toBaseQuantity: angstrom,
    fromBaseQuantity: invert(angstrom),
  },
  {
    // https://physics.nist.gov/cgi-bin/cuu/Value?bohrrada0
    // ≈ 5.29177210903 x 10e-11 m
    name: 'bohr',
    symbols: ['a0', 'a₀'],
    pretty: 'a₀',
    baseQuantity: 'length',
    toBaseQuantity: bohr,
    fromBaseQuantity: invert(bohr),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1×10e−18 m
    name: 'attometre',
    baseQuantity: 'length',
    symbols: ['am'],
    toBaseQuantity: attometre,
    fromBaseQuantity: invert(attometre),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1×10e−15 m
    name: 'fermi',
    baseQuantity: 'length',
    symbols: ['fm'],
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
    symbols: ['au'],
    baseQuantity: 'length',
    pretty: 'astronomic alunit',
    toBaseQuantity: astronomicalunit,
    fromBaseQuantity: invert(astronomicalunit),
  },
  {
    // https://en.wikipedia.org/wiki/Light-second
    // ≡ 299792458 m
    name: 'lightsecond',
    symbols: ['ls'],
    baseQuantity: 'length',
    pretty: 'light second',
    toBaseQuantity: lightsecond,
    fromBaseQuantity: invert(lightsecond),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 60 light-seconds
    name: 'lightminute',
    baseQuantity: 'length',
    pretty: 'light minute',
    toBaseQuantity: lightminute,
    fromBaseQuantity: invert(lightminute),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 60 light-minutes
    name: 'lighthour',
    symbols: ['lh'],
    baseQuantity: 'length',
    pretty: 'light hour',
    toBaseQuantity: lighthour,
    fromBaseQuantity: invert(lighthour),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 24 light-hours
    name: 'lightday',
    symbols: ['ld'],
    pretty: 'light day',
    baseQuantity: 'length',
    toBaseQuantity: lightday,
    fromBaseQuantity: invert(lightday),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 9.4607304725808×10e15 m
    name: 'lightyear',
    symbols: ['ly'],
    pretty: 'light year',
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
    symbols: ['ch'],
    toBaseQuantity: chain,
    fromBaseQuantity: invert(chain),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 1.8288 m
    // ≡ 6 ft (US)
    name: 'fathom',
    baseQuantity: 'length',
    symbols: ['ftm'],
    toBaseQuantity: fathom,
    fromBaseQuantity: invert(fathom),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≡ 1⁄100 ch ≡ 0.66 ft (US) ≡ 7.92 in
    // ≈ 0.2011684 m
    name: 'link',
    baseQuantity: 'length',
    symbols: ['lnk'],
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
    symbols: ['pc'],
    toBaseQuantity: parsec,
    fromBaseQuantity: invert(parsec),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≈ 0.000351450 m
    // ≡ 1⁄72.272 in
    name: 'point',
    baseQuantity: 'length',
    symbols: ['pt'],
    toBaseQuantity: point,
    fromBaseQuantity: invert(point),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // = 1.7638×10−5 m
    // ≡ 1⁄1440 in
    name: 'twip',
    baseQuantity: 'length',
    symbols: ['twp'],
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
    symbols: ['rd'],
    toBaseQuantity: rod,
    fromBaseQuantity: invert(rod),
  },
  {
    // https://en.wikipedia.org/wiki/Conversion_of_units
    // ≈ 4828 m
    name: 'league',
    baseQuantity: 'length',
    symbols: ['lea'],
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
