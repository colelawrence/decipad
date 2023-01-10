import DeciNumber from '.';

export const lessThan = (a: DeciNumber, b: DeciNumber) => a.compare(b) < 0;

export const lessThanOrEqualTo = (a: DeciNumber, b: DeciNumber) =>
  a.compare(b) <= 0;

export const greaterThan = (a: DeciNumber, b: DeciNumber) => lessThan(b, a);

export const greaterThanOrEqualTo = (a: DeciNumber, b: DeciNumber) =>
  lessThanOrEqualTo(b, a);
