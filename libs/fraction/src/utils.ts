import Fraction from 'fraction.js/bigfraction';
import FFraction, { FractionLike } from '.';

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

const fractionLikeProps: ReadonlyArray<keyof FractionLike> = [
  'n',
  'd',
  's',
] as const;

export const isFractionLike = (f: unknown): f is FractionLike => {
  return (
    typeof f === 'object' &&
    f !== null &&
    fractionLikeProps.every(
      (prop) => prop in f && typeof (f as FractionLike)[prop] === 'bigint'
    )
  );
};

export const F = (n: number | bigint): Fraction => {
  return new Fraction(n);
};

export const from = (f: FractionLike): Fraction => {
  return f instanceof Fraction ? f : new Fraction(f);
};
