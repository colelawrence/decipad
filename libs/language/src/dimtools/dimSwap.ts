import { getDefined } from '@decipad/utils';
import { Value } from '../interpreter';
import { InferError, Type, build as t } from '../type';
import { chooseFirst, deLinearizeType, linearizeType } from './common';
import { SwappedHypercube } from '../lazy/SwappedHypercube';
import { ConcreteValue } from '../lazy/ConcreteValue';

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
  const swapped = new SwappedHypercube(
    ConcreteValue.fromValue(value, type),
    dominantIndexName
  );

  return swapped;
};
