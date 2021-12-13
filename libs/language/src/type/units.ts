import { produce } from 'immer';
import pluralize, { singular } from '../pluralize';
import { AST, Type } from '..';
import { getDefined, units } from '../utils';
import { isKnownSymbol, areUnitsCompatible, expandUnits } from '../units';

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

const byExp = (u1: AST.Unit, u2: AST.Unit): number => Number(u2.exp - u1.exp);

const pluralizeUnit = (
  baseUnit: AST.Unit,
  value: bigint | number = 2n
): AST.Unit => {
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
  units1: AST.Units | null,
  units2: AST.Units | null
) => {
  const [expandedUnit1] = expandUnits(units1);
  const expandedUnits1 = expandedUnit1?.args ?? [];
  const [expandedUnit2] = expandUnits(units2);
  const expandedUnits2 = expandedUnit2?.args ?? [];
  if (expandedUnits1.length !== expandedUnits2.length) {
    return false;
  }

  const pendingMatch = Array.from(expandedUnits2);
  for (const unit of expandedUnits1) {
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

const simplifyUnitsArgs = (units: AST.Unit[]): AST.Unit[] => {
  return units
    .map((u) => pluralizeUnit(u))
    .reduce<AST.Unit[]>((units, unit) => {
      const matchingUnitIndex = units.findIndex(
        (candidate) => unit.unit === candidate.unit
      );
      if (matchingUnitIndex >= 0) {
        const matchingUnit = units[matchingUnitIndex];
        units[matchingUnitIndex] = produce(matchingUnit, (match) => {
          match.exp += unit.exp;
          match.multiplier *= unit.multiplier ** Number(unit.exp);
        });
        return units;
      } else {
        return [...units, unit];
      }
    }, [])
    .filter((unit) => unit.exp !== 0n);
};

export const simplifyUnits = (units: AST.Units | null): AST.Units | null => {
  if (units == null) {
    return units;
  }
  return produce(units, (u) => {
    u.args = simplifyUnitsArgs(u.args);
  });
};

export const normalizeUnits = (units: AST.Unit[] | null): AST.Unit[] | null => {
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

export const normalizeUnitsOf = (unit: AST.Units | null): AST.Units | null => {
  if (unit == null) {
    return null;
  }
  return produce(unit, (unit) => {
    unit.args = normalizeUnits(unit.args) || [];
  });
};

export const setExponent = (unit: AST.Unit, newExponent: bigint) =>
  produce(unit, (unit) => {
    unit.exp = newExponent;
  });

export const inverseExponent = (unit: AST.Unit) => setExponent(unit, -unit.exp);

const stringifyUnit = (unit: AST.Unit) => {
  const result = [multipliersToPrefixes[unit.multiplier], unit.unit];

  if (unit.exp !== 1n) {
    result.push(`^${unit.exp}`);
  }

  return result.join('');
};

export const stringifyUnitArgs = (
  units: AST.Unit[] | null,
  value?: number
): string => {
  return (units ?? [])
    .reduce((parts: string[], unit: AST.Unit): string[] => {
      if (parts.length > 0) {
        const op = unit.exp > 0 ? '.' : '/';
        parts.push(op);
        parts.push(
          stringifyUnit(
            produce(unit, (unit) => {
              if (unit.exp < 0n) {
                unit.unit = singular(unit.unit);
                unit.exp = BigInt(Math.abs(Number(unit.exp)));
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
    return stringifyUnitArgs(sortedUnits.args, value);
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
  by: bigint | number
): AST.Units | null =>
  normalizeUnitsOf(
    produce(myUnits, (myUnits) => {
      for (const u of myUnits.args) {
        try {
          u.exp = BigInt(Number(u.exp) * Number(by));
        } catch (err) {
          const error = new Error(
            `error multiplying ${u.exp} by ${by}: ${(err as Error).message}`
          );
          throw error;
        }
      }
    })
  );

export const setUnit = (t: Type, newUnit: AST.Units | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
