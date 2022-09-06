import Fraction, { toFraction } from '@decipad/fraction';
import { getUnitByName, knowsUnit, unitUsesPrefixes } from '.';
import { Unit } from '..';
import { F } from '../utils';

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
  yocto: toFraction(1, 1_000_000_000_000_000_000_000_000), // 1e-24,
  zepto: toFraction(1, 1_000_000_000_000_000_000_000), // 1e-21,
  atto: toFraction(1, 1_000_000_000_000_000_000), // 1e-18,
  femto: toFraction(1, 1_000_000_000_000_000), // 1e-15,
  pico: toFraction(1, 1_000_000_000_000), // 1e-12,
  nano: toFraction(1, 1_000_000_000), // 1e-9,
  micro: toFraction(1, 1_000_000), // 1e-6,
  milli: toFraction(1, 1_000), // 1e-3,
  centi: toFraction(1, 100), // 1e-2,
  deci: toFraction(1, 10), // 1e-1,
  deca: toFraction(10), // 1e1,
  hecto: toFraction(100), // 1e2,
  kilo: toFraction(1_000), // 1e3,
  mega: toFraction(1_000_000), // 1e6,
  giga: toFraction(1_000_000_000), // 1e9,
  tera: toFraction(1_000_000_000_000), // 1e12,
  peta: toFraction(1_000_000_000_000_000), // 1e15,
  exa: toFraction(1_000_000_000_000_000_000), // 1e18,
  zetta: toFraction(1_000_000_000_000_000_000_000), // 1e21,
  yotta: toFraction(1_000_000_000_000_000_000_000_000), // 1e24,
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
  return [toFraction(1), unitName];
}

export function parseUnit(unitString: string): Unit {
  const knownUnit = getUnitByName(unitString);
  if (knownUnit) {
    return {
      unit: unitString,
      exp: F(1),
      multiplier: F(1),
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
      multiplier = F(1);
    }
    if (!unitUsesPrefixes(name)) {
      const matchesExponent = name.match(/(.*)([0-9])+$/);
      if (matchesExponent) {
        const [, name, exponent] = matchesExponent;

        return {
          unit: name,
          exp: F(exponent),
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
      exp: F(exponent),
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
