/* eslint-disable no-param-reassign */
import DeciNumber, { N, ONE, TWO } from '@decipad/number';
import {
  getUnitByName,
  pluralizeUnit,
  prettyForSymbol,
  simplifyUnits,
  singular,
  Unit,
  unitIsSymbol,
} from '@decipad/language';
import produce from 'immer';
import { DeciNumberPart } from './formatNumber';

const numberToSubOrSuperscript: Record<string, string[]> = {
  '0': ['₀', '⁰'], // subscript not used for now
  '1': ['₁', '¹'],
  '2': ['₂', '²'],
  '3': ['₃', '³'],
  '4': ['₄', '⁴'],
  '5': ['₅', '⁵'],
  '6': ['₆', '⁶'],
  '7': ['₇', '⁷'],
  '8': ['₈', '⁸'],
  '9': ['₉', '⁹'],
  '+': ['₊', '⁺'], // minus
  '-': ['₋', '⁻'], // minus
  '.': ['·', '˙'], // dot
  '/': ['/', 'ᐟ'], // slash
};

const multipliersToPrefixes = {
  1e-30: ['q', 'quecto'],
  1e-27: ['r', 'ronto'],
  1e-24: ['y', 'yocto'],
  1e-21: ['z', 'zepto'],
  1e-18: ['a', 'atto'],
  1e-15: ['f', 'femto'],
  1e-12: ['p', 'pico'],
  1e-9: ['n', 'nano'],
  0.000001: ['μ', 'micro'], // 1e-6
  0.001: ['m', 'milli'], // 1e-3
  0.01: ['c', 'centi'], // 1e-2
  0.1: ['d', 'deci'], // 1e-1
  1: ['', ''],
  10: ['da', 'deca'], // 1e1
  100: ['h', 'hecto'], // 1e2
  1000: ['k', 'kilo'], // 1e3
  1000000: ['M', 'mega'], // 1e6
  1000000000: ['G', 'giga'], // 1e9
  1000000000000: ['T', 'tera'], // 1e12
  1000000000000000: ['P', 'peta'], // 1e15
  1000000000000000000: ['E', 'exa'], // 1e18
  1e21: ['Z', 'zetta'],
  1e24: ['Y', 'yotta'],
  1e27: ['R', 'ronna'],
  1e30: ['Q', 'quetta'],
} as const;

type AvailablePrefixes = keyof typeof multipliersToPrefixes;

function scriptFromNumber(n: string): string {
  return numberToSubOrSuperscript[n]?.[1] || n;
}

const byExp = (u1: Unit, u2: Unit): number => Number(N(u2.exp).sub(u1.exp));

const produceExp = (unit: Unit, makePositive = false): Unit => {
  return produce(unit, (u) => {
    u.unit = singular(u.unit);
    if (makePositive) {
      u.exp = N(u.exp).abs();
    }
  });
};

const isInteger = (f: DeciNumber): boolean => {
  return f.d === 1n;
};

export function prettyENumbers(
  exponent: string,
  show10 = false,
  coefficient = '1'
): string {
  return `${+coefficient === 1 ? '' : coefficient}${
    show10 ? ' ×10' : ''
  }${exponent.replace('+', '').replace(/./g, scriptFromNumber)}`.trim();
}
export interface UnitPart {
  type:
    | 'unit'
    | 'unit-literal'
    | 'unit-exponent'
    | 'unit-quality'
    | 'unit-group'
    | 'unit-prefix';
  value: string;
  originalValue?: string; // for values that are prettified
  base?: string; // for unit conversions in the ui
}

const stringifyUnit = (
  unit: Unit,
  prettify = true,
  ignoreExp = false
): UnitPart[] => {
  const symbol = singular(unit.unit.toLowerCase());
  const fullUnit = getUnitByName(symbol);
  const pretty = prettyForSymbol[symbol];
  const base =
    fullUnit?.superBaseQuantity === 'currency'
      ? 'currency'
      : fullUnit?.baseQuantity || 'user-defined-unit';
  const isSymbol = unitIsSymbol(symbol);
  const multiPrefix = unit.multiplier ? N(unit.multiplier).valueOf() : 1;
  const prefix = multipliersToPrefixes[multiPrefix as AvailablePrefixes];

  const result: UnitPart[] = [];

  if (prefix != null) {
    if (isSymbol) {
      result.push({
        type: 'unit-prefix',
        value: prefix[0],
      });
    } else {
      result.push({
        type: 'unit-prefix',
        value: prefix[1],
      });
    }
  } else {
    let multiplierString = multiPrefix.toString();
    if (!multiplierString.includes('e')) {
      const asNumber = +multiplierString;
      multiplierString = asNumber.toExponential().toString();
    }
    const [coefficient, exponent] = multiplierString.toString().split('e');
    result.push({
      type: 'unit-exponent',
      originalValue: multiPrefix.toString(),
      value: prettyENumbers(exponent, true, coefficient),
    });
    result.push({
      type: 'unit-literal',
      value: ' ',
    });
  }

  if (prettify && pretty) {
    result.push({
      type: 'unit',
      originalValue: unit.baseSuperQuantity === 'currency' ? pretty : unit.unit,
      value: pretty,
      base,
    });
  } else {
    result.push({
      type: 'unit',
      value: unit.unit,
      base,
    });
  }

  const exp = N(unit.exp);

  if (!exp.equals(ONE)) {
    const strExp = isInteger(exp)
      ? exp.toString()
      : `${[Math.sign(Number(exp.s)) === -1 && '-', exp.n, '/', exp.d]
          .filter(Boolean)
          .join('')}`;

    const prettyExp = prettyENumbers(strExp);

    //
    // when we say per kg, it means kg^-1
    // however we already sorted this previously
    // and dont want to show the exponent twice
    //
    if (!ignoreExp) {
      if (prettify) {
        result.push({
          type: 'unit-exponent',
          value: prettyExp,
          originalValue: strExp,
        });
      } else {
        result.push({
          type: 'unit-exponent',
          originalValue: strExp,
          value: `^${strExp}`,
        });
      }
    }
  }

  if (unit.quality) {
    result.push({
      type: 'unit-quality',
      originalValue: unit.quality,
      value: ` of ${unit.quality}`,
    });
  }

  // 1 multipliers dont affect strings so we remove useless
  // declarations
  return result.filter((x) => x.value !== '');
};

export const formatUnitArgs = (
  units: Unit[] | null,
  value?: DeciNumber,
  prettify = true,
  previousLength = 0
) => {
  const unitsLength = units?.length ?? 0 + previousLength;
  return (units ?? []).reduce((parts: UnitPart[], unit: Unit) => {
    if (parts.length > 0) {
      let prefix: string;
      //
      // when you have two units you show
      // meter per second
      // but when you have more previousLength = 0
      // you use international system like `m.s-1`
      //
      if (unitsLength === 2 && N(unit.exp).compare(N(-1)) === 0) {
        if (prettify) {
          if (unitIsSymbol(unit.unit)) {
            parts.push({
              type: 'unit-group',
              value: '/',
            });
          } else {
            parts.push({ type: 'unit-literal', value: ' ' });
            parts.push({
              type: 'unit-group',
              value: 'per',
            });
            parts.push({ type: 'unit-literal', value: ' ' });
          }
        }
        stringifyUnit(produceExp(unit, true), prettify).forEach((x) =>
          parts.push(x)
        );
      } else {
        prefix = prettify ? '·' : '*';
        parts.push({
          type: 'unit-group',
          value: prefix,
        });
        stringifyUnit(produceExp(unit), prettify).forEach((x) => parts.push(x));
      }
    } else if (unitsLength === 1 && N(unit.exp).compare(N(-1)) === 0) {
      parts.push({ type: 'unit-literal', value: ' ' });
      parts.push({
        type: 'unit-group',
        value: 'per',
      });
      parts.push({ type: 'unit-literal', value: ' ' });
      stringifyUnit(pluralizeUnit(unit, 1), prettify, true).forEach((x) =>
        parts.push(x)
      );
    } else {
      stringifyUnit(
        pluralizeUnit(
          unit,
          units && unitsLength > 2 ? 2 : value?.valueOf() || 2
        ),
        prettify
      ).forEach((x) => parts.push(x));
    }
    return parts;
  }, []);
};

function fixSpaces(partsOfUnit: UnitPart[]) {
  return partsOfUnit
    .reduce(
      //
      // we want to join strings with a space, but with expecting
      // for multipliers, e.g. `km` not `k m`
      //
      (p, d, i, a) =>
        p +
        (i > 0 &&
        (a[i - 1].type === 'unit-prefix' || // `km` not `k m`
          d.type === 'unit-exponent' || // 2^420 not 2 ^420
          d.type === 'unit-literal' ||
          (a[i + 1] && a[i + 1].type === 'unit-literal') ||
          a[i - 1].type === 'unit-literal') // `1 meter per second` not `1 meter  per  second`
          ? ''
          : ' ') +
        d.value,
      ''
    )
    .trim();
}

export function formatUnitAsParts(
  _locale: string,
  units: Unit[],
  value: DeciNumber = TWO,
  prettify = true,
  previousLength = 0
): DeciNumberPart {
  const simplified = simplifyUnits(units) || units;
  const sortedUnits = [...simplified].sort(byExp);
  const unitParts = formatUnitArgs(
    sortedUnits,
    value,
    prettify,
    previousLength
  );
  return {
    type: 'unit',
    value: fixSpaces(unitParts),
    partsOf: unitParts as UnitPart[],
  };
}

export function formatUnit(
  locale: string,
  units: Unit[],
  value: DeciNumber = TWO,
  prettify = true,
  previousLength = 0
): string {
  const parts = formatUnitAsParts(
    locale,
    units,
    value,
    prettify,
    previousLength
  );
  if (parts.partsOf) {
    return parts.partsOf.map((x) => x.value).join('');
  }
  throw new Error('This should not happen its a typescript imposition');
}

function isUserDefinedUnit(unit: Unit | null): boolean {
  if (!unit) {
    return false;
  }
  const fullUnit = getUnitByName(unit.unit);
  return (
    unit != null &&
    !fullUnit?.baseQuantity &&
    N(unit.exp).equals(ONE) &&
    N(unit.multiplier).equals(ONE)
  );
}

export function isUserDefined(unit: Unit[] | null): boolean {
  if (unit?.length === 1) {
    return isUserDefinedUnit(unit[0]);
  }
  return false;
}

function simpleFormatUnitPart(unit: Unit): string {
  const multiplier = N(unit.multiplier).valueOf();
  const multiplierStr =
    multipliersToPrefixes[
      multiplier as keyof typeof multipliersToPrefixes
    ]?.[0] ?? `${multiplier} * `;
  const exp = N(unit.exp).valueOf();
  const expStr = exp === 1 ? '' : `^${exp}`;
  const value = `${multiplierStr}${unit.unit}${expStr}`;
  return value;
}

export function simpleFormatUnit(units: Unit[]): string {
  return units.reduce(
    (str, u) =>
      str ? `${str} * ${simpleFormatUnitPart(u)}` : simpleFormatUnitPart(u),
    ''
  );
}
