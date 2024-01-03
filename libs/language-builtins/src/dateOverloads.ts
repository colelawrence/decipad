import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  Value,
  Time,
  Type,
  Unknown,
  buildType as t,
} from '@decipad/language-types';
import { OverloadedBuiltinSpec } from './overloadBuiltin';
import { getDefined, getInstanceof } from '@decipad/utils';

export const addDateAndTimeQuantity = async (
  date: Value.DateValue,
  unit: Time.TimeUnit,
  amount: bigint
): Promise<Value.DateValue> => {
  const newDate = await Time.addTime(await date.getData(), unit, amount);
  if (newDate == null) {
    return Value.DateValue.fromDateAndSpecificity(undefined, date.specificity);
  }

  return Value.DateValue.fromDateAndSpecificity(newDate, date.specificity);
};

export const dateAndTimeQuantityFunctor = async ([
  date,
  timeQuantity,
]: Type[]): Promise<Type> =>
  (await Type.combine(date.isDate(), timeQuantity.isTimeQuantity())).mapType(
    () => {
      const dateSpecificity = getDefined(date.date);

      const lowestUnit = Time.getHighestSpecificity(
        getDefined(timeQuantity.unit)
      );

      if (Time.cmpSpecificities(dateSpecificity, lowestUnit) < 0) {
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

  if (Time.cmpSpecificities(d1Specificity, d2Specificity) !== 0) {
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
  [v1, v2]: Value.Value[],
  [, t2]: Type[] = []
) => {
  const amount = (
    await getInstanceof(v2, Value.NumberValue).getData()
  ).valueOf();
  const unit = getDefined(t2?.unit);
  return addDateAndTimeQuantity(
    getInstanceof(v1, Value.DateValue),
    Time.timeUnitFromUnits(unit),
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
        const number = getInstanceof(v2, Value.NumberValue);

        const negatedQuantity = BigInt(
          (await number.getData()).neg().valueOf()
        );

        return addDateAndTimeQuantity(
          getInstanceof(v1, Value.DateValue),
          Time.timeUnitFromUnits(getDefined(t2?.unit)),
          negatedQuantity
        );
      },
      functor: dateAndTimeQuantityFunctor,
    },
    {
      argTypes: ['date', 'date'],
      fnValues: async ([v1, v2]) => {
        const d1 = getInstanceof(v1, Value.DateValue);
        const d2 = getInstanceof(v2, Value.DateValue);
        const difference = await Time.subtractDates(d1, d2, d1.specificity);
        if (difference === Unknown) {
          return Value.UnknownValue;
        }

        return Value.NumberValue.fromValue(difference);
      },
      functor: subtractDatesFunctor,
    },
  ],
};
