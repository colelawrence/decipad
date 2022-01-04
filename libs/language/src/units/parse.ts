import Fraction from '@decipad/fraction';
import { knowsUnit } from '.';
import { Unit } from '..';

const abbreviatedPrefixes = {
  y: 'yocto',
  z: 'zepto',
  a: 'atto',
  f: 'femto',
  p: 'pico',
  n: 'nano',
  μ: 'micro',
  m: 'milli',
  c: 'centi',
  d: 'deci',
  da: 'deca',
  h: 'hecto',
  k: 'kilo',
  M: 'mega',
  G: 'giga',
  T: 'tera',
  P: 'peta',
  E: 'exa',
  Z: 'zetta',
  Y: 'yotta',
};

const multiplierPrefixToFraction = {
  yocto: new Fraction(1, 1_000_000_000_000_000_000_000_000), // 1e-24,
  zepto: new Fraction(1, 1_000_000_000_000_000_000_000), // 1e-21,
  atto: new Fraction(1, 1_000_000_000_000_000_000), // 1e-18,
  femto: new Fraction(1, 1_000_000_000_000_000), // 1e-15,
  pico: new Fraction(1, 1_000_000_000_000), // 1e-12,
  nano: new Fraction(1, 1_000_000_000), // 1e-9,
  micro: new Fraction(1, 1_000_000), // 1e-6,
  milli: new Fraction(1, 1_000), // 1e-3,
  centi: new Fraction(1, 100), // 1e-2,
  deci: new Fraction(1, 10), // 1e-1,
  deca: new Fraction(10), // 1e1,
  hecto: new Fraction(100), // 1e2,
  kilo: new Fraction(1_000), // 1e3,
  mega: new Fraction(1_000_000), // 1e6,
  giga: new Fraction(1_000_000_000), // 1e9,
  tera: new Fraction(1_000_000_000_000), // 1e12,
  peta: new Fraction(1_000_000_000_000_000), // 1e15,
  exa: new Fraction(1_000_000_000_000_000_000), // 1e18,
  zetta: new Fraction(1_000_000_000_000_000_000_000), // 1e21,
  yotta: new Fraction(1_000_000_000_000_000_000_000_000), // 1e24,
};

const multiplierPrefixes = Object.keys(multiplierPrefixToFraction);

function trimPrefix(unitName: string): [Fraction, string] {
  for (const fullPrefix of multiplierPrefixes) {
    if (unitName.startsWith(fullPrefix)) {
      return [
        multiplierPrefixToFraction[
          fullPrefix as keyof typeof multiplierPrefixToFraction
        ],
        unitName.substring(fullPrefix.length),
      ];
    }
  }
  if (unitName.startsWith('da')) {
    return [multiplierPrefixToFraction.deca, unitName.slice(2)];
  } else if (unitName[0] in abbreviatedPrefixes) {
    const prefix =
      abbreviatedPrefixes[unitName[0] as keyof typeof abbreviatedPrefixes];
    return [
      multiplierPrefixToFraction[
        prefix as keyof typeof multiplierPrefixToFraction
      ],
      unitName.slice(1),
    ];
  }
  return [new Fraction(1), unitName];
}

export function parseUnit(unitString: string): Unit {
  if (knowsUnit(unitString)) {
    return {
      unit: unitString,
      exp: 1n,
      multiplier: new Fraction(1),
      known: true,
    };
  } else {
    let [multiplier, name] = trimPrefix(unitString);
    const known = knowsUnit(name);

    const smallPrefix = unitString.length - name.length < 3;

    if (!known && smallPrefix) {
      name = unitString;
      multiplier = new Fraction(1);
    }

    return {
      unit: name,
      exp: 1n,
      multiplier,
      known,
    };
  }
}
