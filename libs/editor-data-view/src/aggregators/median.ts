import { Result } from '@decipad/computer';
import { Aggregator } from '../types';
import { average } from './average';

const { Column } = Result;

export const median: Aggregator = (input) => {
  const { type, value } = input;
  const elementCount = value.rowCount;
  if (elementCount < 1) {
    return undefined;
  }
  const halfLength = (elementCount - 1) / 2;
  if (elementCount % 2 === 1) {
    // odd, just return the element in the middle
    return {
      type,
      value: value.atIndex(Math.floor(halfLength)),
    } as Result.Result;
  }
  const centerLeftIndex = Math.floor(halfLength);
  const centerElements = [
    value.atIndex(centerLeftIndex),
    value.atIndex(centerLeftIndex + 1),
  ];
  return average({ type, value: Column.fromValues(centerElements) });
};
