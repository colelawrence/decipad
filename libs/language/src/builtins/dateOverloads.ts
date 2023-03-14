import { N } from '@decipad/number';
import { DateValue, NumberValue } from '../value';
import {
  addTime,
  cmpSpecificities,
  getHighestSpecificity as getMostSpecific,
  subtractDates,
  Time,
  timeUnitFromUnits,
} from '../date';
import { getDefined, getInstanceof } from '../utils';
import { Type, buildType as t, InferError } from '../type';
import { OverloadedBuiltinSpec } from './overloadBuiltin';

export const addDateAndTimeQuantity = (
  date: DateValue,
  unit: Time.Unit,
  amount: bigint
) => {
  const newDate = addTime(date.getData(), unit, amount);

  return DateValue.fromDateAndSpecificity(newDate, date.specificity);
};

export const dateAndTimeQuantityFunctor = ([date, timeQuantity]: Type[]) =>
  Type.combine(date.isDate(), timeQuantity.isTimeQuantity()).mapType(() => {
    const dateSpecificity = getDefined(date.date);

    const lowestUnit = getMostSpecific(getDefined(timeQuantity.unit));

    if (cmpSpecificities(dateSpecificity, lowestUnit) < 0) {
      return t.impossible(
        InferError.mismatchedSpecificity(dateSpecificity, lowestUnit)
      );
    } else {
      return date;
    }
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
        exp: N(1),
        multiplier: N(1),
        known: true,
      },
    ])
  );
};

export const dateOverloads: Record<string, OverloadedBuiltinSpec[]> = {
  '+': [
    {
      argTypes: ['date', 'number'],
      fnValues: ([v1, v2], [, t2] = []) =>
        addDateAndTimeQuantity(
          getInstanceof(v1, DateValue),

          timeUnitFromUnits(getDefined(t2?.unit)),
          BigInt(getInstanceof(v2, NumberValue).getData().valueOf())
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
          getInstanceof(v2, DateValue),
          timeUnitFromUnits(getDefined(t1?.unit)),
          BigInt(getInstanceof(v1, NumberValue).getData().valueOf())
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
        const number = getInstanceof(v2, NumberValue);

        const negatedQuantity = BigInt(number.getData().neg().valueOf());

        return addDateAndTimeQuantity(
          getInstanceof(v1, DateValue),
          timeUnitFromUnits(getDefined(t2?.unit)),
          negatedQuantity
        );
      },
      functor: dateAndTimeQuantityFunctor,
    },
    {
      argTypes: ['date', 'date'],
      fnValues: ([v1, v2]) => {
        const d1 = getInstanceof(v1, DateValue);
        const d2 = getInstanceof(v2, DateValue);
        const difference = subtractDates(d1, d2, d1.specificity);

        return NumberValue.fromValue(difference);
      },
      functor: subtractDatesFunctor,
    },
  ],
};
