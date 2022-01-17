import { produce } from 'immer';
import Fraction from '@decipad/fraction';
import pluralize, { singular } from '../pluralize';
import { Type } from '..';
import { F, getDefined } from '../utils';
import { Unit, Units, units } from './unit-type';
import {
  isKnownSymbol,
  areUnitsCompatible,
  expandUnits,
  unitIsSymbol,
  prettyForSymbol,
} from '../units';

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
};

export const timeUnits = new Set([
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

function scriptFromNumber(n: string) {
  return numberToSubOrSuperscript[n][1];
}

const byExp = (u1: Unit, u2: Unit): number => Number(u2.exp.sub(u1.exp));

const pluralizeUnit = (baseUnit: Unit, value: bigint | number = 2n): Unit => {
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

export const removeSingleUnitless = (a: Type, b: Type) => {
  const bothNumbers = a.type === 'number' && b.type === 'number';
  const oneIsUnitless = (a.unit == null) !== (b.unit == null);

  if (bothNumbers && oneIsUnitless) {
    return getDefined(a.unit ?? b.unit);
  } else {
    return null;
  }
};

const simplifyUnitsArgs = (units: Unit[]): Unit[] => {
  return units
    .map((u) => pluralizeUnit(u))
    .reduce<Unit[]>((units, unit) => {
      const matchingUnitIndex = units.findIndex(
        (candidate) => unit.unit === candidate.unit
      );
      if (matchingUnitIndex >= 0) {
        const matchingUnit = units[matchingUnitIndex];
        units[matchingUnitIndex] = produce(matchingUnit, (match) => {
          match.exp = match.exp.add(unit.exp);
          //
          // match.multiplier *= unit.multiplier ** Number(unit.exp);
          //
          match.multiplier = match.multiplier.mul(
            unit.multiplier.pow(unit.exp)
          );
        });
        return units;
      } else {
        return [...units, unit];
      }
    }, [])
    .filter((unit) => unit.exp.compare(F(0)) !== 0);
};

export const simplifyUnits = (units: Units | null): Units | null => {
  if (units == null) {
    return units;
  }
  return produce(units, (u) => {
    u.args = simplifyUnitsArgs(u.args);
  });
};

export const normalizeUnits = (units: Unit[] | null): Unit[] | null => {
  if (units == null) {
    return null;
  }

  const simplified = simplifyUnitsArgs(units);

  if (simplified.length === 0) {
    return null;
  } else {
    return simplified.sort((a, b) => {
      if (a.unit > b.unit) {
        return 1;
      } else if (a.unit < b.unit) {
        return -1;
      } else {
        return 0;
      }
    });
  }
};

export const normalizeUnitsOf = (unit: Units | null): Units | null => {
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

const stringifyUnit = (unit: Unit) => {
  const symbol = singular(unit.unit);
  const pretty = prettyForSymbol[symbol];
  let isSymbol = unitIsSymbol(symbol);
  let baseUnitName = unit.unit;

  if (pretty) {
    isSymbol = true;
    baseUnitName = pretty;
  }

  const multiPrefix = unit.multiplier ? unit.multiplier.valueOf() : 1;
  const prefix = multipliersToPrefixes[multiPrefix as AvailablePrefixes];
  const result = [
    prefix != null
      ? isSymbol
        ? prefix[0]
        : prefix[1]
      : multiPrefix.toString(),
    baseUnitName,
  ];

  if (unit.exp.compare(F(1)) !== 0) {
    const exp = `${unit.exp}`.replace(/./g, scriptFromNumber);
    result.push(exp);
  }

  return result.join('');
};

function produceExp(unit: Unit, makePositive: boolean): Unit {
  return produce(unit, (unit) => {
    unit.unit = singular(unit.unit);
    if (makePositive) {
      unit.exp = unit.exp.abs();
    }
  });
}

export const stringifyUnitArgs = (
  units: Unit[] | null,
  value?: Fraction
): string => {
  return (units ?? [])
    .reduce((parts: string[], unit: Unit): string[] => {
      if (parts.length > 0) {
        let prefix: string;
        //
        // when you have two units you show
        // meter per second
        // but when you have more
        // you use international system like `m.s-1`
        //
        if (units?.length === 2 && unit.exp.compare(F(-1)) === 0) {
          prefix = unitIsSymbol(unit.unit) ? '/' : ' per ';
          parts.push(prefix);
          parts.push(stringifyUnit(produceExp(unit, true)));
        } else {
          prefix = '·';
          parts.push(prefix);
          parts.push(stringifyUnit(produceExp(unit, false)));
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
            )
          )
        );
      }
      return parts;
    }, [])
    .join('');
};

export const stringifyUnits = (
  units: Units | null,
  value?: Fraction
): string => {
  if (units == null || units.args.length === 0) {
    return 'unitless';
  } else {
    const simplified = simplifyUnits(units) || units;
    const sortedUnits = produce(simplified, (units) => {
      units.args.sort(byExp);
    });
    return stringifyUnitArgs(sortedUnits.args, value);
  }
};

export const combineUnits = (
  myUnitsObj: Units | null,
  theirUnitsObj: Units | null
): Units | null => {
  const myUnits = normalizeUnits(myUnitsObj?.args ?? null) ?? [];
  const theirUnits = normalizeUnits(theirUnitsObj?.args ?? null) ?? [];

  const outputUnits: Unit[] = [...theirUnits];

  // Combine their units in
  for (const myUnit of myUnits) {
    const existingUnitIndex = outputUnits.findIndex((u) =>
      areUnitsCompatible(u.unit, myUnit.unit)
    );
    if (existingUnitIndex >= 0) {
      outputUnits[existingUnitIndex] = produce(
        outputUnits[existingUnitIndex],
        (inversed) => {
          inversed.exp = inversed.exp.add(myUnit.exp);
        }
      );
    } else {
      outputUnits.push(myUnit);
    }
  }

  const ret = normalizeUnits(outputUnits);
  return ret == null ? ret : units(...ret);
};

export const multiplyExponent = (myUnits: Units, by: number): Units | null =>
  normalizeUnitsOf(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits.args) {
        try {
          u.exp = u.exp.mul(by);
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
