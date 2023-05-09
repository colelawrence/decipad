import { contiguousSlices, reverseMap, sortMap } from '@decipad/column';
import { compare } from '../compare';
import { ColumnLikeValue } from './types';
import { createColumnSlice } from '../lazy';
import { FilteredColumn, MappedColumn } from './Value';

export const sort = async (col: ColumnLikeValue): Promise<ColumnLikeValue> =>
  MappedColumn.fromColumnValueAndMap(col, await sortMap(col, compare));

export const unique = async (
  col: ColumnLikeValue
): Promise<ColumnLikeValue> => {
  const sorted = await sort(col);
  const slices = (await contiguousSlices(sorted, compare)).map(
    ([index]) => index
  );
  return applyMap(sorted, slices);
};

export const reverse = async (col: ColumnLikeValue): Promise<ColumnLikeValue> =>
  MappedColumn.fromColumnValueAndMap(col, await reverseMap(col));

export const slice = async (
  col: ColumnLikeValue,
  begin: number,
  end: number
): Promise<ColumnLikeValue> => createColumnSlice(col, begin, end);

export const applyMap = (
  col: ColumnLikeValue,
  map: number[]
): ColumnLikeValue => MappedColumn.fromColumnValueAndMap(col, map);

export const applyFilterMap = (
  col: ColumnLikeValue,
  map: boolean[]
): ColumnLikeValue => FilteredColumn.fromColumnValueAndMap(col, map);
