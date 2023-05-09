import { ColumnLike } from './ColumnLike';
import { SlicesMap } from './SlicesMap';
import { CompareFn } from './types';

export const contiguousSlices = async <T>(
  column: ColumnLike<T>,
  compare: CompareFn<T>
): Promise<SlicesMap> => {
  const slices: SlicesMap = [];
  let lastValue: T | undefined;
  let nextSliceBeginsAt = 0;
  let index = -1;
  for await (const currentValue of column.values()) {
    index += 1;
    if (lastValue != null && compare(lastValue, currentValue as T) !== 0) {
      // at the beginning of a new slice
      slices.push([nextSliceBeginsAt, index - 1]);
      nextSliceBeginsAt = index;
    }
    lastValue = currentValue as T;
  }

  const rowCount = await column.rowCount();
  if (nextSliceBeginsAt <= rowCount - 1) {
    slices.push([nextSliceBeginsAt, rowCount - 1]);
  }

  return slices;
};
