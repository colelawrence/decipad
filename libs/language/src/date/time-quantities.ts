import Fraction from '@decipad/fraction';
import { Time, timeUnitToJSDateUnit, TimeQuantity, toLuxonUTC } from '.';
import { getDefined } from '../utils';

export const convertToMs: Partial<Record<Time.Unit, bigint>> = {
  week: BigInt(7 * 24 * 60 * 60 * 1000),
  day: BigInt(24 * 60 * 60 * 1000),
  hour: BigInt(60 * 60 * 1000),
  minute: BigInt(60 * 1000),
  second: BigInt(1000),
  millisecond: BigInt(1),
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

  const added = toLuxonUTC(date).plus({
    [composedUnit]: Number(BigInt(quantity) * compositeMultiplier),
  });

  return BigInt(added.toMillis());
};

export const addTimeQuantity = (date: bigint, quantities: TimeQuantity) =>
  Array.from(quantities.timeUnits.entries()).reduce(
    (date, [unit, quant]) => addSingleQuantity(date, quant, unit),
    date
  );

export const convertTimeQuantityTo = (
  { timeUnits }: TimeQuantity,
  convertTo: Time.Unit
): Fraction => {
  if (timeUnits.size === 0) {
    return new Fraction(0);
  }
  if (timeUnits.size === 1 && timeUnits.has(convertTo)) {
    return new Fraction(timeUnits.get(convertTo) as bigint);
  }

  let accInMs = 0n;
  for (const [unit, value] of timeUnits.entries()) {
    const convertRatio = getDefined(
      convertToMs[unit],
      `time quantity: don't know how to convert from ${unit}`
    );
    accInMs += value * convertRatio;
  }

  const convertRatio = getDefined(
    convertToMs[convertTo],
    `time quantity: don't know how to convert time quantity to ${convertTo}`
  );

  return new Fraction(accInMs, convertRatio);
};
