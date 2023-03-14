import { getDefined } from '@decipad/utils';
import { SwappedDimensions } from '../lazy';
import { ColumnLike, getColumnLike } from '../value';
import { buildType as t, InferError, Type } from '../type';
import { chooseFirst, deLinearizeType, linearizeType } from './common';

export const dimSwapTypes = (dominantIndexName: string, type: Type) => {
  return type.isColumn().mapType((matrix) => {
    const types = linearizeType(matrix);
    const scalarTip = getDefined(types.pop());

    const dimIndex = types.findIndex((t) => t.indexedBy === dominantIndexName);
    if (dimIndex === -1) {
      return t.impossible(InferError.unknownCategory(dominantIndexName));
    }

    return deLinearizeType([...chooseFirst(dimIndex, types), scalarTip]);
  });
};

export const dimSwapValues = (
  dominantIndexName: string,
  type: Type,
  value: ColumnLike
) => {
  const linear = linearizeType(type).slice(0, -1);

  if (linear.length !== value.dimensions.length) {
    throw new Error('panic: incorrect amount of dimensions');
  }

  const indexOfDominantDimension = linear.findIndex(
    (t) => t.indexedBy === dominantIndexName
  );

  if (indexOfDominantDimension === 0) {
    return value;
  }

  if (indexOfDominantDimension < 0) {
    throw new Error('panic: dominant dimension not found');
  }

  const swapped = new SwappedDimensions(
    getColumnLike(value),
    indexOfDominantDimension
  );

  return swapped;
};
