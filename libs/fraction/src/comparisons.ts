import Fraction from '.';

export const lessThan = (a: Fraction, b: Fraction) => a.compare(b) < 0;

export const lessThanOrEqualTo = (a: Fraction, b: Fraction) =>
  a.compare(b) <= 0;

export const greaterThan = (a: Fraction, b: Fraction) => lessThan(b, a);

export const greaterThanOrEqualTo = (a: Fraction, b: Fraction) =>
  lessThanOrEqualTo(b, a);
