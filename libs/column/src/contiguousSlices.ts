import { ColumnLike } from './ColumnLike';
import { SlicesMap } from './SlicesMap';
import { CompareFn } from './types';

export const contiguousSlices = <T>(
  column: ColumnLike<T>,
  compare: CompareFn<T>
): SlicesMap => {
  const slices: SlicesMap = [];
  let lastValue: T | undefined;
  let nextSliceBeginsAt = 0;
  column.values.forEach((currentValue, index) => {
    if (lastValue != null && compare(lastValue, currentValue as T) !== 0) {
      // at the beginning of a new slice
      slices.push([nextSliceBeginsAt, index - 1]);
      nextSliceBeginsAt = index;
    }
    lastValue = currentValue as T;
  });

  if (nextSliceBeginsAt <= column.rowCount - 1) {
    slices.push([nextSliceBeginsAt, column.rowCount - 1]);
  }

  return slices;
};
