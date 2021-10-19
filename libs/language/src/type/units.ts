import { produce } from 'immer';
import { addIrregularRule, singular, plural } from 'pluralize';
import { AST, Type } from '..';
import { getDefined } from '../utils';

addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');

const byExp = (u1: AST.Unit, u2: AST.Unit): number => u2.exp - u1.exp;

const pluralizeUnit = (baseUnit: AST.Unit): AST.Unit => {
  const { unit } = baseUnit;
  const singularUnit = plural(unit);
  if (singularUnit === unit) {
    return baseUnit;
  }
  return produce(baseUnit, (u) => {
    u.unit = singularUnit;
  });
};

const matchUnits = (u1: AST.Unit, u2: AST.Unit) =>
  singular(u1.unit) === singular(u2.unit) && u1.exp === u2.exp;

export const matchUnitArrays = (units1: AST.Unit[], units2: AST.Unit[]) => {
  if (units1.length !== units2.length) return false;
  return units1.every((u1, i) => matchUnits(u1, units2[i]));
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

const normalizeUnits = (units: AST.Unit[] | null) => {
  if (units == null) {
    return null;
  }

  const normalized = units.filter((u) => u.exp !== 0).map(pluralizeUnit);

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

export const setExponent = (unit: AST.Unit, newExponent: number) =>
  produce(unit, (unit) => {
    unit.exp = newExponent;
  });

export const inverseExponent = (unit: AST.Unit) => setExponent(unit, -unit.exp);

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

const stringifyUnit = (unit: AST.Unit) => {
  const result = [multipliersToPrefixes[unit.multiplier], unit.unit];

  if (unit.exp !== 1) {
    result.push(`^${unit.exp}`);
  }

  return result.join('');
};

export const stringifyUnits = (units: AST.Unit[] | null): string => {
  if (units == null || units.length === 0) {
    return 'unitless';
  } else {
    const sortedUnits = produce(units, (units) => units.sort(byExp));
    return sortedUnits
      .reduce((parts: string[], unit: AST.Unit): string[] => {
        if (parts.length > 0) {
          const op = unit.exp > 0 ? '.' : '/';
          parts.push(op);
          parts.push(
            stringifyUnit(
              produce(unit, (unit) => {
                if (unit.exp < 0) {
                  unit.unit = singular(unit.unit);
                }
                unit.exp = Math.abs(unit.exp);
              })
            )
          );
        } else {
          parts.push(stringifyUnit(pluralizeUnit(unit)));
        }
        return parts;
      }, [])
      .join('');
  }
};

export const combineUnits = (
  myUnits: AST.Unit[] | null,
  theirUnits: AST.Unit[] | null
) => {
  myUnits = normalizeUnits(myUnits) ?? [];
  theirUnits = normalizeUnits(theirUnits) ?? [];

  const existingUnits = new Set([...myUnits.map((u) => u.unit)]);
  const outputUnits: AST.Unit[] = [...myUnits];

  // Combine their units in
  for (const theirUnit of theirUnits) {
    if (!existingUnits.has(theirUnit.unit)) {
      // m * s => m.s
      outputUnits.push(theirUnit);
    } else {
      // m^2 * m => m^3
      const existingUnitIndex = myUnits.findIndex(
        (u) => u.unit === theirUnit.unit
      );
      outputUnits[existingUnitIndex] = produce(
        outputUnits[existingUnitIndex],
        (inversed) => {
          inversed.exp += theirUnit.exp;
        }
      );
    }
  }

  return normalizeUnits(outputUnits);
};
