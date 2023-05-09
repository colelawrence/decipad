import { getDefined } from '@decipad/utils';
import { createSwappedDimensions } from '../lazy';
import { ColumnLikeValue, getColumnLike } from '../value';
import { buildType as t, InferError, Type } from '../type';
import { chooseFirst, deLinearizeType, linearizeType } from './common';

export const dimSwapTypes = async (dominantIndexName: string, type: Type) => {
  return (await type.isColumn()).mapType(async (matrix) => {
    const types = linearizeType(await matrix);
    const scalarTip = getDefined(types.pop());

    const dimIndex = types.findIndex((t) => t.indexedBy === dominantIndexName);
    if (dimIndex === -1) {
      return t.impossible(InferError.unknownCategory(dominantIndexName));
    }

    return deLinearizeType([...chooseFirst(dimIndex, types), scalarTip]);
  });
};

export const dimSwapValues = async (
  dominantIndexName: string,
  type: Type,
  value: ColumnLikeValue
): Promise<ColumnLikeValue> => {
  const linear = linearizeType(type).slice(0, -1);

  if (linear.length !== (await value.dimensions()).length) {
    throw new Error('panic: incorrect amount of dimensions');
  }

  const indexOfDominantDimension = linear.findIndex(
    (t) => t.indexedBy === dominantIndexName
  );

  if (indexOfDominantDimension === 0) {
    return Promise.resolve(value);
  }

  if (indexOfDominantDimension < 0) {
    throw new Error('panic: dominant dimension not found');
  }

  return createSwappedDimensions(
    getColumnLike(value),
    indexOfDominantDimension
  );
};
