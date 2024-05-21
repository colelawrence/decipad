import type { Value as ValueTypes } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type * as languageTypes from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  InferError,
  Value,
  buildType as t,
} from '@decipad/language-types';
import { getDefined } from '@decipad/utils';

export const dimSwapTypes = async (
  dominantIndexName: string,
  type: languageTypes.Type
) => {
  return (await type.isColumn()).mapType(async (matrix) => {
    const types = Dimension.linearizeType(await matrix);
    const scalarTip = getDefined(types.pop());

    const dimIndex = types.findIndex((t) => t.indexedBy === dominantIndexName);
    if (dimIndex === -1) {
      return t.impossible(InferError.unknownCategory(dominantIndexName));
    }

    return Dimension.deLinearizeType([
      ...Dimension.chooseFirst(dimIndex, types),
      scalarTip,
    ]);
  });
};

export const dimSwapValues = async (
  dominantIndexName: string,
  type: languageTypes.Type,
  value: ValueTypes.ColumnLikeValue
): Promise<ValueTypes.ColumnLikeValue> => {
  const linear = Dimension.linearizeType(type).slice(0, -1);

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

  return Dimension.createSwappedDimensions(
    Value.getColumnLike(value),
    indexOfDominantDimension
  );
};
