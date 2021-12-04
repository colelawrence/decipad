import { produce } from 'immer';
import pluralize, { singular, addIrregularRule } from 'pluralize';
import { AST, Type } from '..';
import { getDefined, units } from '../utils';
import { isKnownSymbol, areUnitsCompatible, expandUnits } from '../units';

addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'are');

const multipliersToPrefixes: Record<number, string> = {
  1e-18: 'a',
  1e-15: 'f',
  1e-12: 'p',
  1e-9: 'n',
  1e-6: 'μ',
  1e-3: 'm',
  1e-2: 'c',
  1e-1: 'd',
  1: '',
  1e1: 'da',
  1e2: 'h',
  1e3: 'k',
  1e6: 'M',
  1e9: 'g',
  1e12: 't',
  1e15: 'p',
  1e18: 'e',
  1e21: 'z',
  1e24: 'y',
};

const byExp = (u1: AST.Unit, u2: AST.Unit): number => u2.exp - u1.exp;

const pluralizeUnit = (baseUnit: AST.Unit, value?: number): AST.Unit => {
  const { unit } = baseUnit;
  if (isKnownSymbol(unit)) {
    return baseUnit;
  }
  const pluralUnit = pluralize(unit, value || 2);
  if (pluralUnit === unit) {
    return baseUnit;
  }
  return produce(baseUnit, (u) => {
    u.unit = pluralUnit;
  });
};

export const matchUnitArrays = (
  units1: AST.Units | null,
  units2: AST.Units | null
) => {
  const [array1] = expandUnits(units1?.args ?? []) ?? [];
  const [array2] = expandUnits(units2?.args ?? []) ?? [];
  if ((array1 ?? []).length !== (array2 ?? []).length) return false;

  const pendingMatch = (array2 && Array.from(array2)) ?? [];
  for (const unit of array1 ?? []) {
    let match: AST.Unit | undefined;
    for (const matchingUnit of pendingMatch) {
      if (
        unit.exp === matchingUnit.exp &&
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

export const normalizeUnits = (units: AST.Unit[] | null) => {
  if (units == null) {
    return null;
  }

  const normalized = units
    .filter((u) => u.exp !== 0)
    .map((u) => pluralizeUnit(u));

  if (normalized.length === 0) {
    return null;
  } else {
    return normalized.sort((a, b) => {
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

export const normalizeUnitsOf = (unit: AST.Units | null): AST.Units | null => {
  if (unit == null) {
    return null;
  }
  return produce(unit, (unit) => {
    unit.args = normalizeUnits(unit.args) || [];
  });
};

export const setExponent = (unit: AST.Unit, newExponent: number) =>
  produce(unit, (unit) => {
    unit.exp = newExponent;
  });

export const inverseExponent = (unit: AST.Unit) => setExponent(unit, -unit.exp);

const stringifyUnit = (unit: AST.Unit) => {
  const result = [multipliersToPrefixes[unit.multiplier], unit.unit];

  if (unit.exp !== 1) {
    result.push(`^${unit.exp}`);
  }

  return result.join('');
};

export const stringifyUnits = (
  units: AST.Units | null,
  value?: number
): string => {
  if (units == null || units.args.length === 0) {
    return 'unitless';
  } else {
    const sortedUnits = produce(units, (units) => {
      units.args.sort(byExp);
    });
    return sortedUnits.args
      .reduce((parts: string[], unit: AST.Unit): string[] => {
        if (parts.length > 0) {
          const op = unit.exp > 0 ? '.' : '/';
          parts.push(op);
          parts.push(
            stringifyUnit(
              produce(unit, (unit) => {
                if (unit.exp < 0) {
                  unit.unit = singular(unit.unit);
                  unit.exp = Math.abs(unit.exp);
                }
              })
            )
          );
        } else {
          parts.push(stringifyUnit(pluralizeUnit(unit, value)));
        }
        return parts;
      }, [])
      .join('');
  }
};

export const combineUnits = (
  myUnitsObj: AST.Units | null,
  theirUnitsObj: AST.Units | null
): AST.Units | null => {
  const myUnits = normalizeUnits(myUnitsObj?.args ?? null) ?? [];
  const theirUnits = normalizeUnits(theirUnitsObj?.args ?? null) ?? [];

  const outputUnits: AST.Unit[] = [...theirUnits];

  // Combine their units in
  for (const myUnit of myUnits) {
    const existingUnitIndex = outputUnits.findIndex((u) =>
      areUnitsCompatible(u.unit, myUnit.unit)
    );
    if (existingUnitIndex >= 0) {
      outputUnits[existingUnitIndex] = produce(
        outputUnits[existingUnitIndex],
        (inversed) => {
          inversed.exp += myUnit.exp;
        }
      );
    } else {
      outputUnits.push(myUnit);
    }
  }

  const ret = normalizeUnits(outputUnits);
  return ret == null ? ret : units(...ret);
};

export const multiplyExponent = (
  myUnits: AST.Units,
  by: number
): AST.Units | null =>
  normalizeUnitsOf(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits.args) {
        u.exp *= by;
      }
    })
  );

export const setUnit = (t: Type, newUnit: AST.Units | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
