import type { SlicesMap } from '@decipad/column';
import { compare } from '../compare';
import { ColumnLikeValue, Value } from './types';
import { ColumnSlice } from '../lazy/ColumnSlice';
import { FilteredColumn, MappedColumn } from './Value';

export function sortMap(col: ColumnLikeValue): number[] {
  const unsortedIndexes = Array.from({ length: col.rowCount }, (_, i) => i);
  return unsortedIndexes.sort((aIndex, bIndex) => {
    return compare(col.atIndex(aIndex), col.atIndex(bIndex));
  });
}

export function sort(col: ColumnLikeValue): ColumnLikeValue {
  return MappedColumn.fromColumnValueAndMap(col, sortMap(col));
}

export function unique(col: ColumnLikeValue): ColumnLikeValue {
  const sorted = sort(col);
  const slices = contiguousSlices(sorted).map(([index]) => index);
  return applyMap(sorted, slices);
}

function reverseMap(col: ColumnLikeValue) {
  const length = col.rowCount;
  return Array.from({ length }, (_, i) => length - i - 1);
}

export function reverse(col: ColumnLikeValue): ColumnLikeValue {
  return MappedColumn.fromColumnValueAndMap(col, reverseMap(col));
}

export function slice(
  col: ColumnLikeValue,
  begin: number,
  end: number
): ColumnLikeValue {
  return ColumnSlice.fromColumnAndRange(col, begin, end);
}

export function applyMap(col: ColumnLikeValue, map: number[]): ColumnLikeValue {
  return MappedColumn.fromColumnValueAndMap(col, map);
}

export function applyFilterMap(
  col: ColumnLikeValue,
  map: boolean[]
): ColumnLikeValue {
  return FilteredColumn.fromColumnValueAndMap(col, map);
}

export function contiguousSlices(column: ColumnLikeValue): SlicesMap {
  const slices: SlicesMap = [];
  let lastValue: undefined | Value;
  let nextSliceBeginsAt = 0;
  column.values.forEach((currentValue, index) => {
    if (lastValue && compare(lastValue, currentValue) !== 0) {
      // at the beginning of a new slice
      slices.push([nextSliceBeginsAt, index - 1]);
      nextSliceBeginsAt = index;
    }
    lastValue = currentValue;
  });

  if (nextSliceBeginsAt <= column.rowCount - 1) {
    slices.push([nextSliceBeginsAt, column.rowCount - 1]);
  }

  return slices;
}
