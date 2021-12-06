import Fraction from 'fraction.js';
import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';
import { Unit, Units } from '../parser/ast-types';
import { expandUnits, contractUnits } from './expand';
import { simplifyUnits, stringifyUnits } from '../type/units';

function areQuantityUnitsCompatible(a: Unit, b: Unit): boolean {
  return a.unit === b.unit && a.exp === b.exp && a.multiplier === b.multiplier;
}

function baseQuantityUnits(units: Units | null): Units | null {
  if (units == null) {
    return units;
  }
  return simplifyUnits(
    produce(units, (units) => {
      units.args = units.args.map((unit) => {
        return produce(unit, (unit) => {
          const knownUnit = getUnitByName(unit.unit);
          return produce(unit, (unit) => {
            unit.unit = knownUnit ? knownUnit.baseQuantity : unit.unit;
            unit.multiplier = 1;
          });
        });
      });
    })
  );
}

export function areUnitsConvertible(unitsA: Units, unitsB: Units): boolean {
  const [sourceUnits] = expandUnits(unitsA);
  const [targetUnits] = expandUnits(unitsB);
  const baseQuantitySourceUnits = baseQuantityUnits(sourceUnits);
  const baseQuantityTargetUnits = baseQuantityUnits(targetUnits);

  if (
    (baseQuantitySourceUnits?.args ?? []).length !==
    (baseQuantityTargetUnits?.args ?? []).length
  ) {
    return false;
  }

  const pendingMatchUnits = new Set(baseQuantityTargetUnits?.args);
  for (const baseQuantitySourceUnit of baseQuantitySourceUnits?.args ?? []) {
    for (const pendingMatchUnit of pendingMatchUnits) {
      if (
        areQuantityUnitsCompatible(baseQuantitySourceUnit, pendingMatchUnit)
      ) {
        pendingMatchUnits.delete(pendingMatchUnit);
        break;
      }
    }
  }
  return pendingMatchUnits.size === 0;
}

export function toExpandedBaseQuantity(
  n: Fraction,
  sourceUnits: Units
): [Units | null, Fraction] {
  const [expandedUnits, convert] = expandUnits(sourceUnits);
  return [expandedUnits, convert(n)];
}
//
// fixme: once front end specs exist
// this should be compliant with workspace definitions
// left simple as a start
//
// note: potentially this could auto conform, like
// 0.10m are 100cm.
//
// 1×10^−6 m = 1 μm
//
export function prettyUnits(n: Fraction, unit: Unit): string {
  const unitDefinition = getDefined(getUnitByName(unit.unit));

  if (unitDefinition.pretty) {
    return unitDefinition.pretty(n);
  } else {
    return `${n} ${
      (unitDefinition.abbreviations && unitDefinition.abbreviations[0]) ||
      unitDefinition.name
    }`;
  }
}

function convertToOutputMultipliers(
  n: Fraction,
  fromUnits: Units | null,
  toUnits: Units | null
): Fraction {
  const from = (fromUnits?.args ?? []).reduce(
    (n, { multiplier, exp }) => n.mul(multiplier ** exp),
    n
  );
  const to = (toUnits?.args ?? []).reduce(
    (n, { multiplier, exp }) => n.div(multiplier ** exp),
    from
  );
  return to;
}

export function fromExpandedBaseQuantity(
  n: Fraction,
  targetUnits: Units
): [Units | null, Fraction] {
  const [, convert] = contractUnits(targetUnits);
  return [targetUnits, convert(n)];
}

export function convertBetweenUnits(
  n: Fraction,
  from: Units,
  to: Units
): Fraction {
  if (!areUnitsConvertible(from, to)) {
    throw new TypeError(
      `Don't know how to convert between ${stringifyUnits(
        from
      )} and ${stringifyUnits(to)}`
    );
  }
  const [expandedUnits, expandedN] = toExpandedBaseQuantity(n, from);
  const [outputUnits, revertedN] = fromExpandedBaseQuantity(expandedN, to);

  const convertedN = convertToOutputMultipliers(
    revertedN,
    expandedUnits,
    outputUnits
  );

  return convertedN;
}
