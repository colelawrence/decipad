import type Fraction from '.';

export const max = (a: Fraction, ...rest: Fraction[]): Fraction => {
  return rest.reduce((a, b) => {
    if (a.compare(b) > 0) {
      return a;
    }
    return b;
  }, a);
};
