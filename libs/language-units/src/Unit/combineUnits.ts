import { produce } from '@decipad/utils';
import { areUnitsCompatible } from '../units/known-units';
import type { Unit } from './Unit';
import { normalizeUnits } from './normalizeUnits';
import { areUnitQualitiesCompatible } from './areUnitQualitiesCompatible';

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
