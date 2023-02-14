import DeciNumber, { N, ONE } from '@decipad/number';
import { getUnitByName, knowsUnit, unitUsesPrefixes } from '.';
import { Unit } from '..';

const abbreviatedPrefixes = {
  q: 'quecto',
  r: 'ronto',
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
  R: 'ronna',
  Q: 'quetta',
} as const;

type AbbreviatedPrefixes = typeof abbreviatedPrefixes;

type MultiplierPrefixToFraction = {
  [P in AbbreviatedPrefixes[keyof AbbreviatedPrefixes]]: DeciNumber;
};
const multiplierPrefixToFraction: MultiplierPrefixToFraction = {
  quecto: N(1, 1_000_000_000_000_000_000_000_000_000_000n), // 1e-30,
  ronto: N(1, 1_000_000_000_000_000_000_000_000_000n), // 1e-27,
  yocto: N(1, 1_000_000_000_000_000_000_000_000n), // 1e-24,
  zepto: N(1, 1_000_000_000_000_000_000_000n), // 1e-21,
  atto: N(1, 1_000_000_000_000_000_000n), // 1e-18,
  femto: N(1, 1_000_000_000_000_000n), // 1e-15,
  pico: N(1, 1_000_000_000_000n), // 1e-12,
  nano: N(1, 1_000_000_000n), // 1e-9,
  micro: N(1, 1_000_000n), // 1e-6,
  milli: N(1, 1_000n), // 1e-3,
  centi: N(1, 100n), // 1e-2,
  deci: N(1, 10n), // 1e-1,
  deca: N(10n), // 1e1,
  hecto: N(100n), // 1e2,
  kilo: N(1_000n), // 1e3,
  mega: N(1_000_000n), // 1e6,
  giga: N(1_000_000_000n), // 1e9,
  tera: N(1_000_000_000_000n), // 1e12,
  peta: N(1_000_000_000_000_000n), // 1e15,
  exa: N(1_000_000_000_000_000_000n), // 1e18,
  zetta: N(1_000_000_000_000_000_000_000n), // 1e21,
  yotta: N(1_000_000_000_000_000_000_000_000n), // 1e24,
  ronna: N(1_000_000_000_000_000_000_000_000_000n), // 1e27,
  quetta: N(1_000_000_000_000_000_000_000_000_000_000n), // 1e30,
};

const multiplierPrefixes = Object.keys(multiplierPrefixToFraction);

function trimPrefix(unitName: string): [DeciNumber, string] {
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
  return [ONE, unitName];
}

export function parseUnit(unitString: string): Unit {
  const knownUnit = getUnitByName(unitString);
  if (knownUnit) {
    return {
      unit: unitString,
      exp: ONE,
      multiplier: ONE,
      known: true,
      baseQuantity: knownUnit.baseQuantity,
      baseSuperQuantity: knownUnit.superBaseQuantity ?? knownUnit.baseQuantity,
    };
  } else {
    const trimResult = trimPrefix(unitString);
    let multiplier = trimResult[0];
    let name = trimResult[1];
    const exponent = 1;
    const known = knowsUnit(name);

    const smallPrefix = unitString.length - name.length < 3;

    if (!known && smallPrefix) {
      name = unitString;
      multiplier = ONE;
    }
    if (!unitUsesPrefixes(name)) {
      const matchesExponent = name.match(/(.*)([0-9])+$/);
      if (matchesExponent) {
        const [, name, exponent] = matchesExponent;

        return {
          unit: name,
          exp: N(exponent),
          multiplier,
          known,
        };
      } else {
        //
        // this is a user invented unit that collided?
        // or is this an error?
        //
        // cause microkph is not really a thing
        //
        // todo: code review
        //
      }
    }

    const ret = {
      unit: name,
      exp: N(exponent),
      multiplier,
      known,
    };

    if (known) {
      const maybeACurrency = getUnitByName(name);
      if (maybeACurrency && maybeACurrency.superBaseQuantity === 'currency') {
        return { ...ret, baseSuperQuantity: 'currency' };
      } else {
        return ret;
      }
    }

    return ret;
  }
}
