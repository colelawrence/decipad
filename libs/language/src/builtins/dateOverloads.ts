import { Date, TimeQuantity } from '../interpreter/Value';

import {
  addTimeQuantities,
  addTimeQuantity,
  cmpSpecificities,
  getHighestSpecificity as getMostSpecific,
  negateTimeQuantity,
  timeUnitsUpTo,
  timeSpecificityToTimeUnit,
  subtractDates,
} from '../date';
import { getDefined, getInstanceof } from '../utils';
import { Type, build as t, InferError } from '../type';
import { OverloadedBuiltinSpec } from './overloadBuiltin';

type OverloadSet = Record<string, OverloadedBuiltinSpec[]>;

export const addDateAndTimeQuantity = (
  date: Date,
  timeQuantity: TimeQuantity
) => {
  const newDate = addTimeQuantity(date.getData(), timeQuantity);

  return Date.fromDateAndSpecificity(newDate, date.specificity);
};

export const dateAndTimeQuantityFunctor = ([date, timeQuantity]: Type[]) =>
  Type.combine(date.isDate(), timeQuantity.isTimeQuantity()).mapType(() => {
    const dateSpecificity = getDefined(date.date);

    const lowestUnit = getMostSpecific(getDefined(timeQuantity.timeUnits));

    if (cmpSpecificities(dateSpecificity, lowestUnit) < 0) {
      return t.impossible(
        InferError.mismatchedSpecificity(dateSpecificity, lowestUnit)
      );
    } else {
      return date;
    }
  });

export const timeQuantityBinopFunctor = ([t1, t2]: Type[]) =>
  Type.combine(t1.isTimeQuantity(), t2.isTimeQuantity()).mapType(() => {
    const allTimeUnits = new Set([
      ...getDefined(t1.timeUnits),
      ...getDefined(t2.timeUnits),
    ]);
    return t.timeQuantity(Array.from(allTimeUnits));
  });

export const subtractDatesFunctor = ([t1, t2]: Type[]) => {
  const d1Specificity = getDefined(t1.date);
  const d2Specificity = getDefined(t2.date);
  if (cmpSpecificities(d1Specificity, d2Specificity) !== 0) {
    return t.impossible(
      InferError.mismatchedSpecificity(d1Specificity, d2Specificity)
    );
  }

  return Type.combine(
    t1.isDate(),
    t2.isDate(),
    t.timeQuantity(timeUnitsUpTo(timeSpecificityToTimeUnit(d1Specificity)))
  );
};

export const dateOverloads: OverloadSet = {
  '+': [
    {
      argTypes: ['date', 'time-quantity'],
      fnValues: (v1, v2) =>
        addDateAndTimeQuantity(
          getInstanceof(v1, Date),
          getInstanceof(v2, TimeQuantity)
        ),
      functor: dateAndTimeQuantityFunctor,
    },
    {
      argTypes: ['time-quantity', 'date'],
      fnValues: (v1, v2) =>
        addDateAndTimeQuantity(
          getInstanceof(v2, Date),
          getInstanceof(v1, TimeQuantity)
        ),
      functor: ([a, b]) => dateAndTimeQuantityFunctor([b, a]),
    },
    {
      argTypes: ['time-quantity', 'time-quantity'],
      fnValues: (v1, v2) =>
        addTimeQuantities(
          getInstanceof(v1, TimeQuantity),
          getInstanceof(v2, TimeQuantity)
        ),
      functor: timeQuantityBinopFunctor,
    },
  ],
  '-': [
    {
      argTypes: ['time-quantity', 'time-quantity'],
      fnValues: (v1, v2) =>
        addTimeQuantities(
          getInstanceof(v1, TimeQuantity),
          negateTimeQuantity(getInstanceof(v2, TimeQuantity))
        ),
      functor: timeQuantityBinopFunctor,
    },
    {
      argTypes: ['date', 'time-quantity'],
      fnValues: (v1, v2) =>
        addDateAndTimeQuantity(
          getInstanceof(v1, Date),
          negateTimeQuantity(getInstanceof(v2, TimeQuantity))
        ),
      functor: dateAndTimeQuantityFunctor,
    },
    {
      argTypes: ['date', 'date'],
      fnValues: (v1, v2) =>
        subtractDates(getInstanceof(v1, Date), getInstanceof(v2, Date)),
      functor: subtractDatesFunctor,
    },
  ],
};
