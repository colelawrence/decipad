import Fraction from '@decipad/fraction';
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

export const convertToMs: Partial<Record<Time.Unit, bigint>> = {
  week: BigInt(7 * 24 * 60 * 60 * 1000),
  day: BigInt(24 * 60 * 60 * 1000),
  hour: BigInt(60 * 60 * 1000),
  minute: BigInt(60 * 1000),
  second: BigInt(1000),
  millisecond: BigInt(1),
};

// Strategy taken from date-fns getDaysInMonth -- seems to be timezone agnostic
const getDaysInMonth = (year: bigint | number, month: bigint | number) => {
  const d = new Date(0);
  d.setFullYear(
    Number(year),
    Number(month) /* next month */,
    0 /* last day of prev month */
  );
  d.setHours(0, 0, 0, 0);
  return d.getDate();
};

// Strategy taken from date-fns addMonths, but this one works in UTC
const addMonths = (date: bigint, months: bigint) => {
  const dateArray = dateToArray(date);

  const [desiredYear, desiredMonth] = dateToArray(
    arrayToDate([dateArray[0], BigInt(dateArray[1]) + months])
  );

  const daysInDesiredMonth = getDaysInMonth(
    BigInt(desiredYear),
    BigInt(desiredMonth)
  );

  const [, , day, ...rest] = dateArray;

  return arrayToDate([
    desiredYear,
    desiredMonth,
    BigInt(Math.min(Number(day), daysInDesiredMonth)),
    ...rest,
  ]);
};

const addSingleQuantity = (
  date: bigint,
  quantity: bigint,
  timeUnit: Time.Unit
): bigint => {
  const [composedUnit, compositeMultiplier] = getDefined(
    timeUnitToJSDateUnit[timeUnit],
    `bad time unit ${timeUnit}`
  );

  timeUnit = composedUnit;
  quantity = BigInt(quantity) * compositeMultiplier;

  if (timeUnit === 'year') {
    return addMonths(date, quantity * 12n);
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

export const addTimeQuantity = (date: bigint, quantities: TimeQuantity) =>
  Array.from(quantities.timeUnits.entries()).reduce(
    (date, [unit, quant]) => addSingleQuantity(date, quant, unit),
    date
  );

export const addTimeQuantities = (
  quantities1: TimeQuantity,
  quantities2: TimeQuantity
): TimeQuantity => {
  const quantitiesMap = new Map<Time.Unit, bigint>(quantities1.timeUnits);
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
): Fraction => {
  if (
    quantity.timeUnitsDiff &&
    quantity.timeUnitsDiff.size === 1 &&
    quantity.timeUnitsDiff.has(convertTo)
  ) {
    return new Fraction(quantity.timeUnitsDiff.get(convertTo) as bigint);
  }
  const { timeUnits } = quantity;
  if (timeUnits.size === 0) {
    return new Fraction(0);
  }
  if (timeUnits.size === 1 && timeUnits.has(convertTo)) {
    return new Fraction(timeUnits.get(convertTo) as bigint);
  }

  let accInMs = 0n;
  for (const [unit, value] of timeUnits.entries()) {
    const convertRatio = convertToMs[unit];
    if (!convertRatio) {
      throw new TypeError(
        `time quantity: don't know how to convert from ${unit}`
      );
    }
    accInMs += value * convertRatio;
  }

  const convertRatio = convertToMs[convertTo];
  if (!convertRatio) {
    throw new TypeError(
      `time quantity: don't know how to convert time quantity to ${convertTo}`
    );
  }

  return new Fraction(accInMs, convertRatio);
};
