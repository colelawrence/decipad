import {
  arrayToDate,
  dateToArray,
  getJSDateUnit,
  jsUnitToIndex,
  Time,
  timeUnitToJSDateUnit,
  timeUnitToIndex,
  timeIndexToUnit,
} from '.';
import { TimeQuantity } from '../interpreter/Value';
import { getDefined } from '../utils';

export const convertToMs: Partial<Record<Time.Unit, number>> = {
  week: 7 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
  millisecond: 1,
};

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
  Array.from(quantities.timeUnits.entries()).reduce(
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

export const timeUnitsUpTo = (maxInclusive: Time.Unit): Time.Unit[] => {
  const maxInclusiveIndex = timeUnitToIndex[maxInclusive];
  const units: Time.Unit[] = [];
  for (let i = 0; i <= maxInclusiveIndex; i += 1) {
    units.push(timeIndexToUnit[i]);
  }
  return units;
};

export const timeSpecificityToTimeUnit = (
  timeSpecificity: Time.Specificity
): Time.Unit => {
  return timeSpecificity === 'time' ? 'millisecond' : timeSpecificity;
};

export const convertTimeQuantityTo = (
  quantity: TimeQuantity,
  convertTo: Time.Unit
): number => {
  if (
    quantity.timeUnitsDiff &&
    quantity.timeUnitsDiff.size === 1 &&
    quantity.timeUnitsDiff.has(convertTo)
  ) {
    return quantity.timeUnitsDiff.get(convertTo) as number;
  }
  const { timeUnits } = quantity;
  if (timeUnits.size === 0) {
    return 0;
  }
  if (timeUnits.size === 1 && timeUnits.has(convertTo)) {
    return timeUnits.get(convertTo) as number;
  }

  let accInMs = BigInt(0);
  for (const [unit, value] of timeUnits.entries()) {
    const convertRatio = convertToMs[unit];
    if (!convertRatio) {
      throw new TypeError(
        `time quantity: don't know how to convert from ${unit}`
      );
    }
    accInMs += BigInt(value * convertRatio);
  }

  const convertRatio = convertToMs[convertTo];
  if (!convertRatio) {
    throw new TypeError(
      `time quantity: don't know how to convert time quantity to ${convertTo}`
    );
  }

  return Number(accInMs / BigInt(convertRatio));
};
