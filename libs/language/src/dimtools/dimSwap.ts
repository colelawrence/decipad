import { getDefined } from '@decipad/utils';
import { InferError, Type, build as t } from '../type';
import { SwappedHypercube } from '../lazy';
import { getColumnLike, Value } from '../value';
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
  value: Value
) => {
  const indexOfDominantDimension = linearizeType(type).findIndex(
    (t) => t.indexedBy === dominantIndexName
  );
  const swapped = new SwappedHypercube(
    getColumnLike(value),
    indexOfDominantDimension
  );

  return swapped;
};
