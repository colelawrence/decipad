import Fraction from '@decipad/fraction';
import produce from 'immer';
import { getUnitByName } from './known-units';
import { expandUnits, contractUnits } from './expand';
import { Unit } from '../type/unit-type';
import { normalizeUnits, simplifyUnits } from '../type/units';
import { zip } from '../utils';
import { InferError } from '../type';

function areQuantityUnitsCompatible(a: Unit, b: Unit): boolean {
  return a.unit === b.unit && a.exp.compare(b.exp) === 0;
}

function areQuantityUnitsReversible(
  a: Unit[] | null,
  b: Unit[] | null
): boolean {
  if (!a || !b) {
    return false;
  }

  const sortedA = normalizeUnits(baseQuantityUnits(a) as Unit[]) as Unit[];
  const sortedB = normalizeUnits(baseQuantityUnits(b) as Unit[]) as Unit[];

  return (
    sortedA.length === sortedB.length &&
    zip(sortedA, sortedB).every(
      ([a, b]) => a.unit === b.unit && a.exp.equals(b.exp.neg())
    )
  );
}

function baseQuantityUnits(units: Unit[] | null): Unit[] | null {
  if (!units?.length) {
    return units;
  }

  return simplifyUnits(
    units.map(
      produce((unit) => {
        const knownUnit = getUnitByName(unit.unit);
        unit.unit = knownUnit ? knownUnit.baseQuantity : unit.unit;
      })
    )
  );
}

export function areUnitsConvertible(unitsA: Unit[], unitsB: Unit[]): boolean {
  const [sourceUnits] = expandUnits(unitsA);
  const [targetUnits] = expandUnits(unitsB);
  const baseQuantitySourceUnits = baseQuantityUnits(sourceUnits);
  const baseQuantityTargetUnits = baseQuantityUnits(targetUnits);

  if (
    (baseQuantitySourceUnits ?? []).length !==
    (baseQuantityTargetUnits ?? []).length
  ) {
    return false;
  }

  if (areQuantityUnitsReversible(sourceUnits, targetUnits)) {
    return true;
  }

  const pendingMatchUnits = new Set(baseQuantityTargetUnits ?? []);
  for (const baseQuantitySourceUnit of baseQuantitySourceUnits ?? []) {
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
  sourceUnits: Unit[]
): [Unit[] | null, Fraction] {
  const [expandedUnits, convert] = expandUnits(sourceUnits);
  return [expandedUnits, convert(n)];
}

export function fromExpandedBaseQuantity(
  n: Fraction,
  targetUnits: Unit[]
): [Unit[] | null, Fraction] {
  const [, convert] = contractUnits(targetUnits);
  return [targetUnits, convert(n)];
}

export function convertBetweenUnits(
  n: Fraction,
  from: Unit[],
  to: Unit[]
): Fraction {
  if (!areUnitsConvertible(from, to)) {
    throw InferError.cannotConvertBetweenUnits(from, to);
  }

  const [expandedUnits, expandedN] = toExpandedBaseQuantity(n, from);
  const [outputUnits, revertedN] = fromExpandedBaseQuantity(expandedN, to);

  if (areQuantityUnitsReversible(expandedUnits, outputUnits)) {
    const [, revertedNReversed] = fromExpandedBaseQuantity(
      expandedN.inverse(),
      to
    );

    return revertedNReversed;
  }

  return revertedN;
}
