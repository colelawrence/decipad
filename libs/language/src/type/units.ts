import Fraction, { FractionLike, pow } from '@decipad/fraction';
import { lenientZip } from '@decipad/utils';
import { Draft, produce } from 'immer';
import { Type } from '..';
import pluralize, { singular } from '../pluralize';
import {
  areUnitsCompatible,
  expandUnits,
  getUnitByName,
  isKnownSymbol,
  prettyForSymbol,
  unitIsSymbol,
} from '../units';
import { F, getDefined } from '../utils';
import { FUnit, FUnits, TUnit, TUnits, Unit, Units, units } from './unit-type';

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

export const timeUnits = new Set([
  'millennium',
  'millenniums',
  'millennia',
  'century',
  'centuries',
  'decade',
  'decades',
  'year',
  'years',
  'quarter',
  'quarters',
  'month',
  'months',
  'day',
  'days',
  'hour',
  'hours',
  'minute',
  'minutes',
  'second',
  'seconds',
  'millisecond',
  'milliseconds',
]);

function scriptFromNumber(n: string): string {
  return numberToSubOrSuperscript[n]?.[1] || n;
}

const byExp = (u1: FUnit, u2: FUnit): number => Number(F(u2.exp).sub(u1.exp));

const pluralizeUnit = <TF extends FractionLike>(
  baseUnit: TUnit<TF>,
  value: bigint | number = 2n
): TUnit<TF> => {
  const { unit } = baseUnit;
  if (isKnownSymbol(unit)) {
    return baseUnit;
  }
  const pluralUnit = pluralize(unit, value);
  if (pluralUnit === unit) {
    return baseUnit;
  }
  return produce(baseUnit, (u) => {
    u.unit = pluralUnit;
  });
};

const areUnitQualitiesCompatible = (
  quality1?: string,
  quality2?: string
): boolean => {
  return (quality1 == null && quality2 == null) || quality1 === quality2;
};

export const matchUnitArrays = (
  units1: Units | null,
  units2: Units | null
): boolean => {
  const [expandedUnit1] = expandUnits(units1);
  const expandedUnits1 = expandedUnit1?.args ?? [];
  const [expandedUnit2] = expandUnits(units2);
  const expandedUnits2 = expandedUnit2?.args ?? [];
  if (expandedUnits1.length !== expandedUnits2.length) {
    return false;
  }

  const pendingMatch = Array.from(expandedUnits2);
  for (const unit of expandedUnits1) {
    let match: Unit | undefined;
    for (const matchingUnit of pendingMatch) {
      if (
        unit.exp.compare(matchingUnit.exp) === 0 &&
        areUnitsCompatible(unit.unit, matchingUnit.unit)
      ) {
        match = matchingUnit;
        break;
      }
    }
    if (match) {
      pendingMatch.splice(pendingMatch.indexOf(match), 1);
    } else {
      return false;
    }
  }

  return pendingMatch.length === 0;
};

export const matchUnitArraysForColumn = (
  _units1: Units | null,
  _units2: Units | null
) => {
  const units1 = normalizeUnits(_units1?.args ?? []) ?? [];
  const units2 = normalizeUnits(_units2?.args ?? []) ?? [];

  if ((units1.length === 0) !== (units2.length === 0)) {
    return true;
  }

  return lenientZip(units1, units2).every(([left, right]) => {
    if (left == null || right == null) {
      return false;
    }

    return (
      left.unit === right.unit &&
      F(left.multiplier).compare(right.multiplier as Fraction) === 0 &&
      F(left.exp).compare(right.exp as Fraction) === 0
    );
  });
};

export const removeSingleUnitless = (a: Type, b: Type) => {
  const bothNumbers = a.type === 'number' && b.type === 'number';
  const oneIsUnitless = (a.unit == null) !== (b.unit == null);

  if (bothNumbers && oneIsUnitless) {
    return getDefined(a.unit ?? b.unit);
  } else {
    return null;
  }
};

const simplifyUnitsArgs = <TF extends FractionLike>(
  units: TUnit<TF>[]
): TUnit<TF>[] => {
  return units
    .map((u) => pluralizeUnit(u))
    .reduce<FUnit[]>((units, unit) => {
      const matchingUnitIndex = units.findIndex(
        (candidate) =>
          unit.unit === candidate.unit &&
          areUnitQualitiesCompatible(unit.quality, candidate.quality)
      );
      if (matchingUnitIndex >= 0) {
        const matchingUnit = units[matchingUnitIndex];
        units[matchingUnitIndex] = produce(matchingUnit, (match) => {
          match.exp = F(match.exp).add(unit.exp);
          //
          // match.multiplier *= unit.multiplier ** Number(unit.exp);
          //
          match.multiplier = F(match.multiplier).mul(
            pow(F(unit.multiplier), F(unit.exp))
          );
        });
        return units;
      } else {
        return [...units, unit];
      }
    }, [])
    .filter((unit) => F(unit.exp).compare(F(0)) !== 0) as TUnit<TF>[];
};

export const simplifyUnits = <TF extends FractionLike>(
  units: TUnits<TF> | null
): TUnits<TF> | null => {
  if (units == null) {
    return units;
  }
  return produce(units, (u) => {
    u.args = simplifyUnitsArgs(u.args);
  });
};

export const normalizeUnitName = (unit: Unit): Unit => {
  const symbolUnit = getUnitByName(unit.unit);
  if (symbolUnit) {
    return produce(unit, (unit) => {
      unit.unit = symbolUnit.name;
    });
  }
  return unit;
};

export const normalizeUnitNames = (units: Unit[]): Unit[] => {
  return units.map(normalizeUnitName);
};

const byUnitName = <TF extends FractionLike>(
  a: TUnit<TF>,
  b: TUnit<TF>
): number => {
  if (a.unit > b.unit) {
    return 1;
  } else if (a.unit < b.unit) {
    return -1;
  } else {
    return 0;
  }
};

export const normalizeUnits = <TF extends FractionLike>(
  units: TUnit<TF>[] | null,
  { mult = false }: { mult?: boolean } = {}
): TUnit<TF>[] | null => {
  if (units == null) {
    return null;
  }
  const simplified = simplifyUnitsArgs(units);

  if (simplified.length === 0) {
    return null;
  } else if (mult) {
    return simplified;
  } else {
    return simplified.sort(byUnitName);
  }
};

export const normalizeUnitsOf = <TF extends FractionLike>(
  unit: TUnits<TF> | null
): TUnits<TF> | null => {
  if (unit == null) {
    return null;
  }
  return produce(unit, (unit) => {
    unit.args = normalizeUnits(unit.args) || [];
  });
};

export const setExponent = (unit: Unit, newExponent: Fraction) =>
  produce(unit, (unit) => {
    unit.exp = newExponent;
  });

export const inverseExponent = (unit: Unit) =>
  setExponent(unit, unit.exp.neg());

const isInteger = (f: FractionLike): boolean => {
  return Number(f.d) === 1;
};

const stringifyUnit = (unit: FUnit, prettify = true) => {
  const symbol = singular(unit.unit.toLowerCase());
  const pretty = prettyForSymbol[symbol];
  const isSymbol = unitIsSymbol(symbol);

  const multiPrefix = unit.multiplier
    ? new Fraction(unit.multiplier).valueOf()
    : 1;
  const prefix = multipliersToPrefixes[multiPrefix as AvailablePrefixes];

  const result = [
    prefix != null
      ? isSymbol
        ? prefix[0]
        : prefix[1]
      : multiPrefix.toString(),
    prettify && pretty ? pretty : unit.unit,
  ];

  const { exp } = unit;
  if (F(exp).compare(F(1)) !== 0) {
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

function produceExp(unit: FUnit, makePositive = false): FUnit {
  return produce(unit, (unit) => {
    unit.unit = singular(unit.unit);
    if (makePositive) {
      unit.exp = F(unit.exp).abs();
    }
  });
}

export const stringifyUnitArgs = (
  units: FUnit[] | null,
  value?: Fraction,
  prettify = true
): string => {
  return (units ?? [])
    .reduce((parts: string[], unit: FUnit): string[] => {
      if (parts.length > 0) {
        let prefix: string;
        //
        // when you have two units you show
        // meter per second
        // but when you have more
        // you use international system like `m.s-1`
        //
        if (units?.length === 2 && F(unit.exp).compare(F(-1)) === 0) {
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
              units && units.length > 2 ? 2 : value?.valueOf() || 2
            ),
            prettify
          )
        );
      }
      return parts;
    }, [])
    .join('');
};

export const stringifyUnits = (
  units: FUnits | null | undefined,
  value?: Fraction,
  prettify = true
): string => {
  if (units == null || units.args.length === 0) {
    return 'unitless';
  } else {
    const simplified = simplifyUnits(units) || units;
    const sortedUnits = produce(simplified, (units) => {
      units.args.sort(byExp);
    });
    return stringifyUnitArgs(sortedUnits.args, value, prettify);
  }
};

export const combineUnits = <TF extends FractionLike>(
  myUnitsObj: TUnits<TF> | null,
  theirUnitsObj: TUnits<TF> | null,
  { mult = false }: { mult?: boolean } = {}
): TUnits<TF> | null => {
  const myUnits = normalizeUnits(myUnitsObj?.args ?? null, { mult }) ?? [];
  const theirUnits =
    normalizeUnits(theirUnitsObj?.args ?? null, { mult }) ?? [];

  const outputUnits: TUnit<TF>[] = mult ? [...myUnits] : [...theirUnits];
  const sourceUnits: TUnit<TF>[] = mult ? theirUnits : myUnits;

  // Combine their units in
  for (const thisUnit of sourceUnits) {
    const existingUnitIndex = outputUnits.findIndex((u) => {
      return (
        areUnitQualitiesCompatible(u.quality, thisUnit.quality) &&
        areUnitsCompatible(u.unit, thisUnit.unit)
      );
    });
    if (existingUnitIndex >= 0) {
      outputUnits[existingUnitIndex] = produce(
        outputUnits[existingUnitIndex],
        (inversed) => {
          inversed.exp = F(inversed.exp).add(
            thisUnit.exp
          ) as unknown as Draft<TF>;
        }
      );
    } else {
      outputUnits.push(thisUnit);
    }
  }

  const ret = normalizeUnits(outputUnits, { mult });
  return ret == null ? ret : units(...ret);
};

export const multiplyExponent = <TF extends FractionLike>(
  myUnits: TUnits<TF>,
  by: number
): TUnits<TF> | null =>
  normalizeUnitsOf(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits.args) {
        try {
          u.exp = F(u.exp).mul(by) as unknown as Draft<TF>;
        } catch (err) {
          const error = new Error(
            `error multiplying ${u.exp} by ${by}: ${(err as Error).message}`
          );
          throw error;
        }
      }
    })
  );

export const setUnit = (t: Type, newUnit: Units | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
