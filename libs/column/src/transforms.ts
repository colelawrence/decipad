import type { ColumnLike } from '.';
import { ColumnSlice } from './ColumnSlice';
import { FilteredColumn } from './FilteredColumn';
import { MappedColumn } from './MappedColumn';
import { SlicesMap } from './SlicesMap';
import { CompareFn } from './types';

export const sortMap = <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): number[] => {
  const unsortedIndexes = Array.from({ length: col.rowCount }, (_, i) => i);
  return unsortedIndexes.sort((aIndex, bIndex) => {
    return compare(col.atIndex(aIndex), col.atIndex(bIndex));
  });
};

export const sort = <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): ColumnLike<TValue> =>
  MappedColumn.fromColumnAndMap(col, sortMap(col, compare));

export const contiguousSlices = <TValue>(
  column: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): SlicesMap => {
  const slices: SlicesMap = [];
  let lastValue: undefined | TValue;
  let nextSliceBeginsAt = 0;
  column.values.forEach((currentValue, index) => {
    if (lastValue && compare(lastValue, currentValue as TValue) !== 0) {
      // at the beginning of a new slice
      slices.push([nextSliceBeginsAt, index - 1]);
      nextSliceBeginsAt = index;
    }
    lastValue = currentValue as TValue;
  });

  if (nextSliceBeginsAt <= column.rowCount - 1) {
    slices.push([nextSliceBeginsAt, column.rowCount - 1]);
  }

  return slices;
};

export const applyMap = <TValue>(
  col: ColumnLike<TValue>,
  map: number[]
): ColumnLike<TValue> => MappedColumn.fromColumnAndMap(col, map);

export const unique = <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): ColumnLike<TValue> => {
  const sorted = sort(col, compare);
  const slices = contiguousSlices(sorted, compare).map(([index]) => index);
  return applyMap(sorted, slices);
};

const reverseMap = <TValue>(col: ColumnLike<TValue>): number[] => {
  const length = col.rowCount;
  return Array.from({ length }, (_, i) => length - i - 1);
};

export const reverse = <TValue>(col: ColumnLike<TValue>): ColumnLike<TValue> =>
  MappedColumn.fromColumnAndMap(col, reverseMap(col));

export const slice = <TValue>(
  col: ColumnLike<TValue>,
  begin: number,
  end: number
): ColumnLike<TValue> => ColumnSlice.fromColumnAndRange(col, begin, end);

export const applyFilterMap = <TValue>(
  col: ColumnLike<TValue>,
  map: boolean[]
): ColumnLike<TValue> => FilteredColumn.fromColumnAndMap(col, map);
