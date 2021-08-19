import {
  arrayToDate,
  dateToArray,
  getJSDateUnit,
  jsUnitToIndex,
  Time,
  timeUnitToJSDateUnit,
} from '.';
import { TimeQuantity } from '../interpreter/Value';
import { getDefined } from '../utils';

// Strategy taken from date-fns getDaysInMonth -- seems to be timezone agnostic
const getDaysInMonth = (year: number, month: number) => {
  const d = new Date(0);
  d.setFullYear(year, month /* next month */, 0 /* last day of prev month */);
  d.setHours(0, 0, 0, 0);
  return d.getDate();
};

// Strategy taken from date-fns addMonths, but this one works in UTC
const addMonths = (date: number, months: number) => {
  const dateArray = dateToArray(date);

  const [desiredYear, desiredMonth] = dateToArray(
    arrayToDate([dateArray[0], dateArray[1] + months])
  );

  const daysInDesiredMonth = getDaysInMonth(desiredYear, desiredMonth);

  const [, , day, ...rest] = dateArray;

  return arrayToDate([
    desiredYear,
    desiredMonth,
    Math.min(day, daysInDesiredMonth),
    ...rest,
  ]);
};

const addSingleQuantity = (
  date: number,
  quantity: number,
  timeUnit: Time.Unit
): number => {
  const [composedUnit, compositeMultiplier] = getDefined(
    timeUnitToJSDateUnit[timeUnit],
    `bad time unit ${timeUnit}`
  );

  timeUnit = composedUnit;
  quantity *= compositeMultiplier;

  if (timeUnit === 'year') {
    return addMonths(date, quantity * 12);
  } else if (timeUnit === 'month') {
    return addMonths(date, quantity);
  } else {
    // JS Date and Date.UTC support out-of-bounds values,
    // by rolling over to the next second/minute/hour/day/year
    // So a naive += is appropriate.
    const dateArray = dateToArray(date);

    dateArray[jsUnitToIndex[getJSDateUnit(timeUnit)]] += quantity;

    return arrayToDate(dateArray);
  }
};

export const addTimeQuantity = (date: number, quantities: TimeQuantity) =>
  [...quantities.timeUnits.entries()].reduce(
    (date, [unit, quant]) => addSingleQuantity(date, quant, unit),
    date
  );

export const addTimeQuantities = (
  quantities1: TimeQuantity,
  quantities2: TimeQuantity
): TimeQuantity => {
  const quantitiesMap = new Map(quantities1.timeUnits);
  for (const [unit, value] of quantities2.timeUnits.entries()) {
    const existing = quantitiesMap.get(unit);
    if (existing != null) {
      quantitiesMap.set(unit, existing + value);
    } else {
      quantitiesMap.set(unit, value);
    }
  }
  return new TimeQuantity(quantitiesMap);
};

export const negateTimeQuantity = (quantity: TimeQuantity) => {
  const retMap = new Map();

  quantity.timeUnits.forEach((quantity, unit) => {
    retMap.set(unit, -quantity);
  });

  return new TimeQuantity(retMap);
};
