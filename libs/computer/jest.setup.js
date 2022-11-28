import Fraction from '@decipad/fraction';

expect.addSnapshotSerializer({
  test: (v) => v instanceof Fraction,
  print: (f) => `Fraction(${f.toString()})`,
});
