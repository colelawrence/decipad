import Fraction from '@decipad/fraction';
import produce from 'immer';
import { getUnitByName } from './known-units';
import { expandUnits, contractUnits } from './expand';
import { RuntimeError } from '../interpreter';
import { Unit, Units } from '../type/unit-type';
import { normalizeUnits, simplifyUnits, stringifyUnits } from '../type/units';
import { zip } from '../utils';

function areQuantityUnitsCompatible(a: Unit, b: Unit): boolean {
  return (
    a.unit === b.unit &&
    a.exp.compare(b.exp) === 0 &&
    a.multiplier.compare(b.multiplier) === 0
  );
}

function areQuantityUnitsReversible(a: Units | null, b: Units | null): boolean {
  if (!a || !b) {
    return false;
  }

  const sortedA = normalizeUnits(
    baseQuantityUnits(a)?.args as Unit[]
  ) as Unit[];
  const sortedB = normalizeUnits(
    baseQuantityUnits(b)?.args as Unit[]
  ) as Unit[];

  return (
    sortedA.length === sortedB.length &&
    zip(sortedA, sortedB).every(
      ([a, b]) => a.unit === b.unit && a.exp.equals(b.exp.neg())
    )
  );
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
            unit.multiplier = new Fraction(1);
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

  if (areQuantityUnitsReversible(sourceUnits, targetUnits)) {
    return true;
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

function convertToOutputMultipliers(
  n: Fraction,
  fromUnits: Units | null,
  toUnits: Units | null
): Fraction {
  const from = (fromUnits?.args ?? []).reduce((n, { multiplier, exp }) => {
    return n.mul(multiplier.pow(new Fraction(exp)));
  }, n);
  const to = (toUnits?.args ?? []).reduce((n, { multiplier, exp }) => {
    return n.div(multiplier.pow(new Fraction(exp)));
  }, from);
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
    throw new RuntimeError(
      `Don't know how to convert between ${stringifyUnits(
        from
      )} and ${stringifyUnits(to)}`
    );
  }
  const [expandedUnits, expandedN] = toExpandedBaseQuantity(n, from);
  const [outputUnits, revertedN] = fromExpandedBaseQuantity(expandedN, to);

  let convertedN;
  if (areQuantityUnitsReversible(expandedUnits, outputUnits)) {
    const [, revertedNReversed] = fromExpandedBaseQuantity(
      expandedN.inverse(),
      to
    );
    convertedN = convertToOutputMultipliers(
      revertedNReversed,
      invertMultiplier(expandedUnits),
      outputUnits
    );
  } else {
    convertedN = convertToOutputMultipliers(
      revertedN,
      expandedUnits,
      outputUnits
    );
  }
  return convertedN;
}

function invertMultiplier(units: Units | null): Units | null {
  if (!units) {
    return units;
  }
  const invertedArgs = (units?.args ?? []).map(
    produce((partialUnit) => {
      partialUnit.multiplier = partialUnit.multiplier.inverse();
    })
  );
  return produce(units, (units) => {
    units.args = invertedArgs;
  });
}
