import DeciNumber, { N, ZERO } from '@decipad/number';
import { lenientZip } from '@decipad/utils';
import { produce } from 'immer';
import type { Type } from '..';
import pluralize from '../langPluralize';
import {
  areUnitsCompatible,
  expandUnits,
  getUnitByName,
  isKnownSymbol,
} from '../units';
import { getDefined } from '../utils';
import type { Unit } from './unit-type';
import { InferError } from './InferError';
import { propagatePercentage } from './percentages';

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

export const pluralizeUnit = (
  baseUnit: Unit,
  value: bigint | number = 2n
): Unit => {
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
  units1?: Unit[] | null,
  units2?: Unit[] | null
): boolean => {
  const [expandedUnit1] = expandUnits(units1);
  const expandedUnits1 = expandedUnit1 ?? [];
  const [expandedUnit2] = expandUnits(units2);
  const expandedUnits2 = expandedUnit2 ?? [];
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
  _units1?: Unit[] | null,
  _units2?: Unit[] | null
) => {
  const units1 = normalizeUnits(_units1) ?? [];
  const units2 = normalizeUnits(_units2) ?? [];

  if ((units1.length === 0) !== (units2.length === 0)) {
    return true;
  }

  return lenientZip(units1, units2).every(([left, right]) => {
    if (left == null || right == null) {
      return false;
    }

    return (
      left.unit === right.unit &&
      left.multiplier.compare(right.multiplier) === 0 &&
      left.exp.compare(right.exp) === 0
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

export const propagateTypeUnits = (me: Type, other: Type) => {
  me = propagatePercentage(me, other);

  me = produce(me, (me) => {
    me.numberError ??= other.numberError;
  });

  const matchingUnits = matchUnitArrays(me.unit, other.unit);
  if (matchingUnits) {
    return me;
  }

  const onlyOneHasAUnit = removeSingleUnitless(me, other);
  if (onlyOneHasAUnit) {
    return setUnit(me, onlyOneHasAUnit);
  }

  return me.withErrorCause(InferError.expectedUnit(other.unit, me.unit));
};

export const simplifyUnits = (units: Unit[]): Unit[] =>
  units
    .map((u) => pluralizeUnit(u))
    .reduce<Unit[]>((units, unit) => {
      const matchingUnitIndex = units.findIndex(
        (candidate) =>
          unit.unit === candidate.unit &&
          areUnitQualitiesCompatible(unit.quality, candidate.quality)
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
    .filter((unit) => N(unit.exp).compare(ZERO) !== 0) as Unit[];

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

const byUnitName = (a: Unit, b: Unit): number => {
  if (a.unit > b.unit) {
    return 1;
  } else if (a.unit < b.unit) {
    return -1;
  } else {
    return 0;
  }
};

export const normalizeUnits = (
  units?: Unit[] | null,
  { mult = false }: { mult?: boolean } = {}
): Unit[] | null => {
  if (!units?.length) {
    return null;
  }

  const simplified = simplifyUnits(units);

  if (simplified.length === 0) {
    return null;
  } else if (mult) {
    return simplified;
  } else {
    return simplified.sort(byUnitName);
  }
};

export const setExponent = produce((unit: Unit, newExponent: DeciNumber) => {
  unit.exp = newExponent;
});

export const inverseExponent = (unit: Unit) =>
  setExponent(unit, unit.exp.neg());

export const combineUnits = (
  myUnitsObj: Unit[] | null,
  theirUnitsObj: Unit[] | null,
  { mult = false }: { mult?: boolean } = {}
): Unit[] | null => {
  const myUnits = normalizeUnits(myUnitsObj, { mult }) ?? [];
  const theirUnits = normalizeUnits(theirUnitsObj, { mult }) ?? [];

  const outputUnits: Unit[] = mult ? [...myUnits] : [...theirUnits];
  const sourceUnits: Unit[] = mult ? theirUnits : myUnits;

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
          inversed.exp = inversed.exp.add(thisUnit.exp);
        }
      );
    } else {
      outputUnits.push(thisUnit);
    }
  }

  return normalizeUnits(outputUnits, { mult });
};

export const multiplyExponent = (myUnits: Unit[], by: number): Unit[] | null =>
  normalizeUnits(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits) {
        try {
          u.exp = u.exp.mul(N(by));
        } catch (err) {
          const error = new Error(
            `error multiplying ${u.exp} by ${by}: ${(err as Error).message}`
          );
          throw error;
        }
      }
    })
  );

export const setUnit = (t: Type, newUnit: Unit[] | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
