import { contiguousSlices, reverseMap, sortMap } from '@decipad/column';
// eslint-disable-next-line no-restricted-imports
import { Dimension, Value, compare } from '@decipad/language-types';

export const sort = async (
  col: Value.ColumnLikeValue
): Promise<Value.ColumnLikeValue> =>
  Value.MappedColumn.fromColumnValueAndMap(col, await sortMap(col, compare));

export const unique = async (
  col: Value.ColumnLikeValue
): Promise<Value.ColumnLikeValue> => {
  const sorted = await sort(col);
  const slices = (await contiguousSlices(sorted, compare)).map(
    ([index]) => index
  );
  return applyMap(sorted, slices);
};

export const reverse = async (
  col: Value.ColumnLikeValue
): Promise<Value.ColumnLikeValue> =>
  Value.MappedColumn.fromColumnValueAndMap(col, await reverseMap(col));

export const slice = async (
  col: Value.ColumnLikeValue,
  begin: number,
  end: number
): Promise<Value.ColumnLikeValue> =>
  Dimension.createColumnSlice(col, begin, end);

export const applyMap = (
  col: Value.ColumnLikeValue,
  map: number[]
): Value.ColumnLikeValue => Value.MappedColumn.fromColumnValueAndMap(col, map);

export const applyFilterMap = (
  col: Value.ColumnLikeValue,
  map: boolean[]
): Value.ColumnLikeValue =>
  Value.FilteredColumn.fromColumnValueAndMap(col, map);
