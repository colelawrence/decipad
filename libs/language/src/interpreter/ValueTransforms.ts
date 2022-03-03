import { Value } from '.';
import { compare } from './compare-values';
import {
  ColumnLike,
  ColumnSlice,
  FilteredColumn,
  MappedColumn,
  SlicesMap,
} from './Value';

export function filterMap(
  col: ColumnLike,
  fn: (value: Value, index?: number) => boolean
): boolean[] {
  return col.values.map(fn);
}

export function sortMap(col: ColumnLike): number[] {
  const unsortedIndexes = Array.from({ length: col.rowCount }, (_, i) => i);
  return unsortedIndexes.sort((aIndex, bIndex) => {
    return compare(col.values[aIndex], col.values[bIndex]);
  });
}

export function sort(col: ColumnLike): ColumnLike {
  return MappedColumn.fromColumnAndMap(col, sortMap(col));
}

export function unique(col: ColumnLike): ColumnLike {
  const sorted = sort(col);
  const slices = contiguousSlices(sorted).map(([index]) => index);
  return applyMap(sorted, slices);
}

function reverseMap(col: ColumnLike) {
  const length = col.rowCount;
  return Array.from({ length: col.values.length }, (_, i) => length - i - 1);
}

export function reverse(col: ColumnLike): ColumnLike {
  return MappedColumn.fromColumnAndMap(col, reverseMap(col));
}

export function slice(col: ColumnLike, begin: number, end: number): ColumnLike {
  return ColumnSlice.fromColumnAndRange(col, begin, end);
}

export function applyMap(col: ColumnLike, map: number[]): ColumnLike {
  return MappedColumn.fromColumnAndMap(col, map);
}

export function applyFilterMap(col: ColumnLike, map: boolean[]): ColumnLike {
  return FilteredColumn.fromColumnAndMap(col, map);
}

export function contiguousSlices(column: ColumnLike): SlicesMap {
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

  if (nextSliceBeginsAt <= column.values.length - 1) {
    slices.push([nextSliceBeginsAt, column.values.length - 1]);
  }

  return slices;
}
