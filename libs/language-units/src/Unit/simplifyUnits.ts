import { produce } from '@decipad/utils';
import { Unit } from './Unit';
import { pluralizeUnit } from './pluralizeUnit';
import { N, ZERO } from '@decipad/number';
import { areUnitQualitiesCompatible } from './areUnitQualitiesCompatible';

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
