// eslint-disable-next-line no-restricted-imports
import { Type, Unit } from '@decipad/language-types';
import { produce } from '@decipad/utils';
import { singular } from 'pluralize';

const tierUnits = new Set(['tier', 'slice']);

const isTierUnit = (unit: string) =>
  tierUnits.has(singular(unit.toLowerCase()));

export const cleanInferred = produce<Type>((t) => {
  if (t.unit) {
    t.unit = produce(t.unit, (units: Unit.Unit[]) =>
      units.reduce((units: Unit.Unit[], other: Unit.Unit) => {
        if (!isTierUnit(other.unit)) {
          units.push(other);
        }
        return units;
      }, [])
    );
    if (t.unit.length < 1) {
      t.unit = null;
    }
  }
});
