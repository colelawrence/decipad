import { N } from '@decipad/number';
import { DateValue, NumberValue, Unknown, UnknownValue, Value } from '../value';
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

export const addDateAndTimeQuantity = async (
  date: DateValue,
  unit: Time.Unit,
  amount: bigint
): Promise<DateValue> => {
  const newDate = await addTime(await date.getData(), unit, amount);
  if (newDate == null) {
    return DateValue.fromDateAndSpecificity(undefined, date.specificity);
  }

  return DateValue.fromDateAndSpecificity(newDate, date.specificity);
};

export const dateAndTimeQuantityFunctor = async ([
  date,
  timeQuantity,
]: Type[]): Promise<Type> =>
  (await Type.combine(date.isDate(), timeQuantity.isTimeQuantity())).mapType(
    () => {
      const dateSpecificity = getDefined(date.date);

      const lowestUnit = getMostSpecific(getDefined(timeQuantity.unit));

      if (cmpSpecificities(dateSpecificity, lowestUnit) < 0) {
        return t.impossible(
          InferError.mismatchedSpecificity(dateSpecificity, lowestUnit)
        );
      } else {
        return date;
      }
    }
  );

export const subtractDatesFunctor = async ([t1, t2]: Type[]) => {
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

const dateAndNumberFnValues = async (
  [v1, v2]: Value[],
  [, t2]: Type[] = []
) => {
  const amount = (await getInstanceof(v2, NumberValue).getData()).valueOf();
  const unit = getDefined(t2?.unit);
  return addDateAndTimeQuantity(
    getInstanceof(v1, DateValue),
    timeUnitFromUnits(unit),
    BigInt(amount)
  );
};

export const dateOverloads: Record<string, OverloadedBuiltinSpec[]> = {
  '+': [
    {
      argTypes: ['date', 'number'],
      fnValues: dateAndNumberFnValues,
      functor: async ([t1, t2]) =>
        Type.combine(t2.isTimeQuantity(), async () =>
          dateAndTimeQuantityFunctor([t1, t2])
        ),
    },
    {
      argTypes: ['number', 'date'],
      fnValues: async (values, types = []) =>
        dateAndNumberFnValues(values.reverse(), types.reverse()),
      functor: async ([t1, t2]) =>
        Type.combine(t1.isTimeQuantity(), async () =>
          dateAndTimeQuantityFunctor([t2, t1])
        ),
    },
  ],
  '-': [
    {
      argTypes: ['date', 'number'],
      fnValues: async ([v1, v2], [, t2] = []) => {
        const number = getInstanceof(v2, NumberValue);

        const negatedQuantity = BigInt(
          (await number.getData()).neg().valueOf()
        );

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
      fnValues: async ([v1, v2]) => {
        const d1 = getInstanceof(v1, DateValue);
        const d2 = getInstanceof(v2, DateValue);
        const difference = await subtractDates(d1, d2, d1.specificity);
        if (difference === Unknown) {
          return UnknownValue;
        }

        return NumberValue.fromValue(difference);
      },
      functor: subtractDatesFunctor,
    },
  ],
};
