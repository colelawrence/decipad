/* eslint-disable no-param-reassign */
import {
  FUnit,
  prettyForSymbol,
  simplifyUnits,
  singular,
  unitIsSymbol,
  pluralizeUnit,
} from '@decipad/language';
import FFraction, { F, FractionLike, ONE } from '@decipad/fraction';
import produce from 'immer';
import { TUnits } from 'libs/language/src/type/unit-type';

const TWO = new FFraction(2);

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
  '-': ['₋', '⁻'], // minus
  '.': ['·', '˙'], // dot
  '/': ['/', 'ᐟ'], // slash
};

export type AvailablePrefixes =
  | 1e24
  | 1e21
  | 1_000_000_000_000_000_000
  | 1_000_000_000_000_000
  | 1_000_000_000_000
  | 1_000_000_000
  | 1_000_000
  | 1_000
  | 100
  | 10
  | 1
  | 0.1
  | 0.01
  | 0.001
  | 0.000001
  | 1e-9
  | 1e-12
  | 1e-15
  | 1e-18;

const multipliersToPrefixes: Record<AvailablePrefixes, string[]> = {
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
};

function scriptFromNumber(n: string): string {
  return numberToSubOrSuperscript[n]?.[1] || n;
}

const byExp = (u1: FUnit, u2: FUnit): number => Number(F(u2.exp).sub(u1.exp));

const produceExp = (unit: FUnit, makePositive = false): FUnit => {
  return produce(unit, (u) => {
    u.unit = singular(u.unit);
    if (makePositive) {
      u.exp = F(u.exp).abs();
    }
  });
};

const isInteger = (f: FractionLike): boolean => {
  return Number(f.d) === 1;
};

const stringifyUnit = (unit: FUnit, prettify = true) => {
  const symbol = singular(unit.unit.toLowerCase());
  const pretty = prettyForSymbol[symbol];
  const isSymbol = unitIsSymbol(symbol);

  const multiPrefix = unit.multiplier ? F(unit.multiplier).valueOf() : 1;
  const prefix = multipliersToPrefixes[multiPrefix as AvailablePrefixes];

  const result = [
    prefix != null
      ? isSymbol
        ? prefix[0]
        : prefix[1]
      : multiPrefix.toString(),
    prettify && pretty ? pretty : unit.unit,
  ];

  const { exp: _exp } = unit;
  const exp = F(_exp);
  if (exp.compare(ONE) !== 0) {
    const strExp = isInteger(exp)
      ? exp.toString()
      : `${[Math.sign(Number(exp.s)) === -1 && '-', exp.n, '/', exp.d]
          .filter(Boolean)
          .join('')}`;
    const prettyExp = strExp.replace(/./g, scriptFromNumber);

    if (prettify) {
      result.push(prettyExp);
    } else {
      result.push('^', strExp);
    }
  }

  if (unit.quality) {
    result.push(` of ${unit.quality}`);
  }

  return result.join('');
};

export const formatUnitArgs = (
  units: FUnit[] | null,
  value?: FFraction,
  prettify = true,
  previousLength = 0
): string => {
  const unitsLength = units?.length ?? 0 + previousLength;
  return (units ?? [])
    .reduce((parts: string[], unit: FUnit): string[] => {
      if (parts.length > 0) {
        let prefix: string;
        //
        // when you have two units you show
        // meter per second
        // but when you have morpreviousLength = 0e
        // you use international system like `m.s-1`
        //
        if (unitsLength === 2 && F(unit.exp).compare(F(-1)) === 0) {
          prefix = prettify ? (unitIsSymbol(unit.unit) ? '/' : ' per ') : '/';
          parts.push(prefix);
          parts.push(stringifyUnit(produceExp(unit, true), prettify));
        } else {
          prefix = prettify ? '·' : '*';
          parts.push(prefix);
          parts.push(stringifyUnit(produceExp(unit), prettify));
        }
      } else {
        //
        // turn off pluralisation if there's more than 2 unit
        //
        parts.push(
          stringifyUnit(
            pluralizeUnit(
              unit,
              units && unitsLength > 2 ? 2 : value?.valueOf() || 2
            ),
            prettify
          )
        );
      }
      return parts;
    }, [])
    .join('');
};

export function formatUnit<TF extends FractionLike = FFraction>(
  _locale: string,
  units: TUnits<TF>,
  value: FFraction = TWO,
  prettify = true,
  previousLength = 0
): string {
  if (units == null || units.args.length === 0) {
    return '';
  }
  const simplified = simplifyUnits(units) || units;
  const sortedUnits = produce(simplified, (u) => {
    u.args.sort(byExp);
  });
  return formatUnitArgs(sortedUnits.args, value, prettify, previousLength);
}
