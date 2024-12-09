import { Result } from '@decipad/language-interfaces';
import { transpose } from 'ramda';
import { rowIsEqual } from './rowIsEqual';

export const uniqueConsecutiveRows = (columns: Result.OneResult[][]) => {
  const rows = transpose(columns);
  let previousRow: Result.OneResult[] = [];
  return transpose(
    rows.filter((row) => {
      const equalToPrevious = rowIsEqual(row, previousRow);
      previousRow = row;
      return !equalToPrevious;
    })
  );
};
