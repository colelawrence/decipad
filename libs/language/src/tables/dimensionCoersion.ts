// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Dimension, Value } from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import { dimSwapTypes, dimSwapValues } from '../dimtools';

/**
 * This module specifies how tables work with 0-dimensional and 2+ dimensional columns.
 *
 * Here's how they work!
 *
 * ```
 * Tbl = { A = 1 }  # Has 1 row
 * Tbl = { Sizer = [1, 2, 3], A = 1 }  # A turns into [1, 2, 3]
 * Tbl = { A = 1, Sizer = [1, 2, 3] }  # Crash! Inconsistent column sizes
 * Tbl = { Nums = [1, 2], TwoD = Tbl.Nums * OtherTable.Nums }  # TwoD indexed by [Tbl, OtherTable.Nums]
 * Tbl = { Nums = [1, 2], TwoD = OtherTable.Nums * Tbl.Nums }  # Same as above even though the operation would've flipped dims
 * ```
 */

/** Make {type} columnar and place {indexName} on top if {type} more than 1D */
export const coerceTableColumnTypeIndices = async (
  type: Type,
  indexName: string
): Promise<Type> => {
  if (type.cellType == null) {
    // Because we're so very nice, allow `Column = 1` as syntax sugar.
    return type;
  } else if (
    Dimension.linearizeType(type).some((t) => t.indexedBy === indexName)
  ) {
    return (await dimSwapTypes(indexName, type)).reduced();
  } else {
    // We want our table index on top
    return type.reduced();
  }
};

export const coerceTableColumnIndices = async (
  type: Type,
  value: ValueTypes.ColumnLikeValue | ValueTypes.Value,
  indexName: string,
  tableLength?: number
): Promise<ValueTypes.ColumnLikeValue> => {
  if (!Value.isColumnLike(value)) {
    return Value.Column.fromValues(
      repeat(value, tableLength ?? 1),
      () => ({
        labels: undefined,
      }),
      Value.defaultValue(type)
    );
  } else if (
    Dimension.linearizeType(type).some((t) => t.indexedBy === indexName)
  ) {
    return dimSwapValues(indexName, type, value);
  } else {
    return value;
  }
};

const repeat = <T>(value: T, length: number) =>
  Array.from({ length }, () => value);
