import { type Result } from '@decipad/language-interfaces';
import { type Comparable, compare } from './compare';

export const rowIsEqual = (
  row1: Result.OneResult[],
  row2: Result.OneResult[]
) => {
  return (
    row1.length === row2.length &&
    row1.every(
      (cell, index) =>
        compare(cell as Comparable, row2[index] as Comparable) === 0
    )
  );
};
