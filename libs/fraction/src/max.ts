import type Fraction from '.';

export const max = (...fs: Fraction[]): Fraction => {
  if (fs.length < 1) {
    throw new Error('dont know the maximum of an empty set of fractions');
  }
  const [a, ...rest] = fs;
  return rest.reduce((a, b) => {
    if (a.compare(b) > 0) {
      return a;
    }
    return b;
  }, a);
};
