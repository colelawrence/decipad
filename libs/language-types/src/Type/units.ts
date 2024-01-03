import { getDefined, produce } from '@decipad/utils';
import { Unit } from '@decipad/language-units';
import { InferError, type Type } from '..';
import { propagatePercentage } from './percentages';

export const removeSingleUnitless = (a: Type, b: Type) => {
  const bothNumbers = a.type === 'number' && b.type === 'number';
  const oneIsUnitless = (a.unit == null) !== (b.unit == null);

  if (bothNumbers && oneIsUnitless) {
    return getDefined(a.unit ?? b.unit);
  } else {
    return null;
  }
};

export const propagateTypeUnits = (me: Type, other: Type) => {
  me = propagatePercentage(me, other);

  me = produce(me, (me) => {
    me.numberError ??= other.numberError;
  });

  const matchingUnits = Unit.matchUnitArrays(me.unit, other.unit);
  if (matchingUnits) {
    return me;
  }

  const onlyOneHasAUnit = removeSingleUnitless(me, other);
  if (onlyOneHasAUnit) {
    return setUnit(me, onlyOneHasAUnit);
  }

  return me.withErrorCause(InferError.expectedUnit(other.unit, me.unit));
};

export const setUnit = (t: Type, newUnit: Unit.Unit[] | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
