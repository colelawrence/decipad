import Fraction from '@decipad/fraction';

import { Date, TimeQuantity, FractionValue } from '../interpreter/Value';
import {
  addTimeQuantity,
  cmpSpecificities,
  getHighestSpecificity as getMostSpecific,
  subtractDates,
} from '../date';
import { F, getDefined, getInstanceof } from '../utils';
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

    const lowestUnit = getMostSpecific(getDefined(timeQuantity.unit?.args));

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
      ...getDefined(t1.unit?.args),
      ...getDefined(t2.unit?.args),
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
    t.number([
      {
        unit: d1Specificity,
        exp: F(1),
        multiplier: new Fraction(1),
        known: true,
      },
    ])
  );
};

export const dateOverloads: OverloadSet = {
  '+': [
    {
      argTypes: ['date', 'number'],
      fnValues: ([v1, v2], [, t2] = []) =>
        addDateAndTimeQuantity(
          getInstanceof(v1, Date),
          TimeQuantity.fromUnits(
            BigInt(getInstanceof(v2, FractionValue).getData().valueOf()),
            getDefined(t2?.unit)
          )
        ),
      functor: ([t1, t2]) =>
        Type.combine(t2.isTimeQuantity(), () =>
          dateAndTimeQuantityFunctor([t1, t2])
        ),
    },
    {
      argTypes: ['number', 'date'],
      fnValues: ([v1, v2], [t1] = []) =>
        addDateAndTimeQuantity(
          getInstanceof(v2, Date),
          TimeQuantity.fromUnits(
            BigInt(getInstanceof(v1, FractionValue).getData().valueOf()),
            getDefined(t1.unit)
          )
        ),
      functor: ([t1, t2]) =>
        Type.combine(t1.isTimeQuantity(), () =>
          dateAndTimeQuantityFunctor([t2, t1])
        ),
    },
  ],
  '-': [
    {
      argTypes: ['date', 'number'],
      fnValues: ([v1, v2], [, t2] = []) => {
        const number = getInstanceof(v2, FractionValue);

        const negatedQuantity = TimeQuantity.fromUnits(
          BigInt(number.getData().neg().valueOf()),
          getDefined(t2?.unit, 'the unit of time must exist')
        );

        return addDateAndTimeQuantity(getInstanceof(v1, Date), negatedQuantity);
      },
      functor: dateAndTimeQuantityFunctor,
    },
    {
      argTypes: ['date', 'date'],
      fnValues: ([v1, v2]) => {
        const d1 = getInstanceof(v1, Date);
        const d2 = getInstanceof(v2, Date);
        const difference = subtractDates(d1, d2, d1.specificity);

        return FractionValue.fromValue(difference);
      },
      functor: subtractDatesFunctor,
    },
  ],
};
