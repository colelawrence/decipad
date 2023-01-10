import DeciNumber from '@decipad/number';

expect.addSnapshotSerializer({
  test: (v) => v instanceof DeciNumber,
  print: (f) => `DeciNumber(${f.toString()})`,
});
