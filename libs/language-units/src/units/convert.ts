import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';
import { produce, getDefined, zip } from '@decipad/utils';
import type { Unit } from '@decipad/language-interfaces';
import { getUnitByName } from './known-units';
import { expandUnits, contractUnits } from '../Unit/expand';
import { getImpreciseConversionFactor } from './imprecise-conversions';
import { normalizeUnits } from '../Unit/normalizeUnits';
import { simplifyUnits } from '../Unit/simplifyUnits';

const getBaseQuantity = (u: Unit) => getUnitByName(u.unit)?.baseQuantity;

export interface ImprecisionOpts {
  tolerateImprecision?: boolean;
}

function areQuantityUnitsCompatible(
  a: Unit,
  b: Unit,
  { tolerateImprecision }: ImprecisionOpts = {}
): boolean {
  if (a.unit === b.unit && a.exp.equals(b.exp)) {
    return true;
  } else {
    const knownUnitA = getUnitByName(a.unit);
    const knownUnitB = getUnitByName(b.unit);
    if (knownUnitB && knownUnitA?.canConvertTo?.(knownUnitB.baseQuantity)) {
      return true;
    }
    if (tolerateImprecision && a.exp.equals(b.exp)) {
      const baseA = getBaseQuantity(a);
      const baseB = getBaseQuantity(b);
      return getImpreciseConversionFactor(baseA, baseB) != null;
    }
  }
  return false;
}

function areQuantityUnitsReversible(
  a: Unit[] | null | undefined,
  b: Unit[] | null | undefined
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

function baseQuantityUnits(
  units: Unit[] | null | undefined
): Unit[] | null | undefined {
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

// eslint-disable-next-line complexity
export function areUnitsConvertible(
  unitsA: Unit[],
  unitsB: Unit[],
  options: ImprecisionOpts = {}
): boolean {
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
        areQuantityUnitsCompatible(
          baseQuantitySourceUnit,
          pendingMatchUnit,
          options
        )
      ) {
        pendingMatchUnits.delete(pendingMatchUnit);
        break;
      }
    }
  }
  return pendingMatchUnits.size === 0;
}

export function toExpandedBaseQuantity(
  n: DeciNumberBase,
  sourceUnits: Unit[]
): [Unit[] | null | undefined, DeciNumberBase] {
  const [expandedUnits, convert] = expandUnits(sourceUnits);
  return [expandedUnits, convert(n)];
}

export function fromExpandedBaseQuantity(
  n: DeciNumberBase,
  targetUnits: Unit[]
): [Unit[] | null, DeciNumberBase] {
  const [, convert] = contractUnits(targetUnits);
  return [targetUnits, convert(n)];
}

export function convertBetweenUnits(
  _n: DeciNumberBase,
  from: Unit[],
  to: Unit[],
  { tolerateImprecision }: ImprecisionOpts = {}
): DeciNumberBase {
  let n = _n;
  if (!areUnitsConvertible(from, to, { tolerateImprecision })) {
    throw new TypeError('Cannot convert between units');
  }

  if (tolerateImprecision && !areUnitsConvertible(from, to)) {
    // It's not convertible precisely, let's go imprecise
    n = impreciselyConvertBetweenUnits(n, from, to);
  } else {
    n = maybePreciselyConvertBetweenKnownUnits(n, from, to);
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

function maybePreciselyConvertBetweenKnownUnits(
  _n: DeciNumberBase,
  _from: Unit[],
  _to: Unit[]
): DeciNumberBase {
  let n = _n;
  const from = getDefined(normalizeUnits(_from), 'could not normalize units');
  const to = getDefined(normalizeUnits(_to), 'could not normalize units');
  for (const fromU of from) {
    for (const toU of to) {
      const basicCompat = areQuantityUnitsCompatible(fromU, toU);
      if (!basicCompat) {
        continue;
      }

      const fromBase = getUnitByName(fromU.unit);
      const toBase = getUnitByName(toU.unit);

      if (fromBase?.name === toBase?.name) {
        continue;
      }

      const conversion =
        fromBase &&
        toBase?.baseQuantity &&
        fromBase.convertTo &&
        n.mul(fromBase.convertTo(toBase.baseQuantity, ONE).pow(toU.exp));

      if (!conversion) {
        continue;
      }
      n = conversion;
    }
  }

  return n;
}

// eslint-disable-next-line complexity
function impreciselyConvertBetweenUnits(
  _n: DeciNumberBase,
  _from: Unit[],
  _to: Unit[]
): DeciNumberBase {
  let n = _n;
  const from = getDefined(normalizeUnits(_from), 'could not normalize units');
  const to = getDefined(normalizeUnits(_to), 'could not normalize units');
  for (const fromU of from) {
    for (const toU of to) {
      const basicCompat = areQuantityUnitsCompatible(fromU, toU);
      if (basicCompat) {
        continue;
      }

      const fromBase = getUnitByName(fromU.unit);
      const toBase = getUnitByName(toU.unit);

      const conversion =
        fromBase?.baseQuantity &&
        toBase?.baseQuantity &&
        getImpreciseConversionFactor(
          fromBase.baseQuantity,
          toBase.baseQuantity
        )?.pow(toU.exp);
      if (!conversion) {
        continue;
      }
      n = n.mul(conversion);
    }
  }

  return n;
}
