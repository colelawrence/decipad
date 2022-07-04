import Fraction, { FractionLike, pow } from '@decipad/fraction';
import { lenientZip } from '@decipad/utils';
import { Draft, produce } from 'immer';
import { Type } from '..';
import pluralize from '../pluralize';
import {
  areUnitsCompatible,
  expandUnits,
  getUnitByName,
  isKnownSymbol,
} from '../units';
import { F, getDefined } from '../utils';
import { FUnit, TUnit, TUnits, Unit, Units, units } from './unit-type';

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

export const pluralizeUnit = <TF extends FractionLike>(
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
