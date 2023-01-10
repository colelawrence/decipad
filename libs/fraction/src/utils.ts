import Fraction, { from } from '.';

export const isZero = (f: Fraction): boolean => {
  return f.compare(0) === 0;
};

export const pow = (a: Fraction, b: Fraction): Fraction => {
  const result = Fraction.prototype.pow.call(a, b);
  if (result == null || isZero(result)) {
    const resultNumber = a.valueOf() ** b.valueOf();
    if (Number.isNaN(resultNumber)) {
      throw new TypeError(
        `**: result of raising to ${b.toString()} is not rational`
      );
    }
    return from(resultNumber);
  }
  return result;
};
