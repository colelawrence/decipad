import Fraction from 'fraction.js/bigfraction';
import FFraction from '.';

export const isZero = (f: FFraction): boolean => {
  return f.compare(0) === 0;
};

export const pow = (a: FFraction, b: FFraction): FFraction => {
  const result = a.pow(b);
  if (result == null || isZero(result)) {
    const resultNumber = a.valueOf() ** b.valueOf();
    if (Number.isNaN(resultNumber)) {
      throw new TypeError(
        `**: result of raising to ${b.toString()} is not rational`
      );
    }
    return new Fraction(resultNumber);
  }
  return result;
};
