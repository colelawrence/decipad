import { contiguousSlices, reverseMap, sortMap } from '@decipad/column';
// eslint-disable-next-line no-restricted-imports
import { Dimension, Value, compare } from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';

export const sort = async (
  col: ValueTypes.ColumnLikeValue
): Promise<ValueTypes.ColumnLikeValue> =>
  Value.MappedColumn.fromColumnValueAndMap(col, await sortMap(col, compare));

export const unique = async (
  col: ValueTypes.ColumnLikeValue
): Promise<ValueTypes.ColumnLikeValue> => {
  const sorted = await sort(col);
  const slices = (await contiguousSlices(sorted, compare)).map(
    ([index]) => index
  );
  return applyMap(sorted, slices);
};

export const reverse = async (
  col: ValueTypes.ColumnLikeValue
): Promise<ValueTypes.ColumnLikeValue> =>
  Value.MappedColumn.fromColumnValueAndMap(col, await reverseMap(col));

export const slice = async (
  col: ValueTypes.ColumnLikeValue,
  begin: number,
  end: number
): Promise<ValueTypes.ColumnLikeValue> =>
  Dimension.createColumnSlice(col, begin, end);

export const applyMap = (
  col: ValueTypes.ColumnLikeValue,
  map: number[]
): ValueTypes.ColumnLikeValue =>
  Value.MappedColumn.fromColumnValueAndMap(col, map);

export const applyFilterMap = (
  col: ValueTypes.ColumnLikeValue,
  map: boolean[]
): ValueTypes.ColumnLikeValue =>
  Value.FilteredColumn.fromColumnValueAndMap(col, map);
