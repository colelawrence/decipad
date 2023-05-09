import { all } from '@decipad/generator-utils';
import { first } from '@decipad/utils';
import type { ColumnLike } from '.';
import { ColumnSlice } from './ColumnSlice';
import { FilteredColumn } from './FilteredColumn';
import { MappedColumn } from './MappedColumn';
import { SlicesMap } from './SlicesMap';
import { CompareFn } from './types';

export const sortMap = async <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): Promise<number[]> => {
  const allValues = await all(col.values());
  const unsortedIndexes = Array.from({ length: allValues.length }, (_, i) => i);
  return unsortedIndexes.sort((aIndex, bIndex) => {
    return compare(allValues[aIndex], allValues[bIndex]);
  });
};

export const sort = async <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): Promise<ColumnLike<TValue>> =>
  MappedColumn.fromColumnAndMap(col, await sortMap(col, compare));

export const contiguousSlices = async <TValue>(
  column: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): Promise<SlicesMap> => {
  const slices: SlicesMap = [];
  let lastValue: undefined | TValue;
  let nextSliceBeginsAt = 0;
  let index = -1;
  for await (const currentValue of column.values()) {
    index += 1;
    if (lastValue && compare(lastValue, currentValue as TValue) !== 0) {
      // at the beginning of a new slice
      slices.push([nextSliceBeginsAt, index - 1]);
      nextSliceBeginsAt = index;
    }
    lastValue = currentValue as TValue;
  }

  const rowCount = await column.rowCount();
  if (nextSliceBeginsAt < rowCount) {
    slices.push([nextSliceBeginsAt, rowCount - 1]);
  }

  return slices;
};

export const applyMap = <TValue>(
  col: ColumnLike<TValue>,
  map: number[]
): ColumnLike<TValue> => MappedColumn.fromColumnAndMap(col, map);

export const unique = async <TValue>(
  col: ColumnLike<TValue>,
  compare: CompareFn<TValue>
): Promise<ColumnLike<TValue>> => {
  const sorted = await sort(col, compare);
  const slices = (await contiguousSlices(sorted, compare)).map(first);
  return applyMap(sorted, slices);
};

export const reverseMap = async <TValue>(
  col: ColumnLike<TValue>
): Promise<number[]> => {
  const length = await col.rowCount();
  return Array.from({ length }, (_, i) => length - i - 1);
};

export const reverse = async <TValue>(
  col: ColumnLike<TValue>
): Promise<ColumnLike<TValue>> =>
  MappedColumn.fromColumnAndMap(col, await reverseMap(col));

export const slice = <TValue>(
  col: ColumnLike<TValue>,
  begin: number,
  end: number
): ColumnLike<TValue> => ColumnSlice.fromColumnAndRange(col, begin, end);

export const applyFilterMap = <TValue>(
  col: ColumnLike<TValue>,
  map: boolean[]
): ColumnLike<TValue> => FilteredColumn.fromColumnAndMap(col, map);
