import produce from 'immer';
import { singular } from 'pluralize';
import { Type, Unit } from '../type';

const tierUnits = new Set(['tier', 'slice']);

const isTierUnit = (unit: string) =>
  tierUnits.has(singular(unit.toLowerCase()));

export const cleanInferred = produce<Type>((t) => {
  if (t.unit) {
    t.unit = produce(t.unit, (units: Unit[]) =>
      units.reduce((units: Unit[], other: Unit) => {
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
