/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { ColumnLikeValue } from '../value';
import { chooseFirst, undoChooseFirst } from '../dimtools/common';
import { implementColumnLike } from './LazyAtIndex';
import { Dimension, MinimalTensor } from './types';

/**
 * Swaps a dimension like so (pseudocode):
 *
 * > unswappedHC
 * [
 *   [1, 2, 3],
 *   [4, 5, 6]
 * ]
 *
 * > swappedHC = new SwappedDimensions(unswappedHC, 1)
 * > swappedHC
 * [
 *   [1, 4],
 *   [2, 5],
 *   [3, 6],
 * ]
 */
const SwappedDimensions = implementColumnLike(
  class SwappedDimensions implements MinimalTensor {
    unswappedHC: ColumnLikeValue;

    _dimensions: Dimension[] | undefined;
    dominantDimensionIndex: number;

    constructor(unswappedHC: ColumnLikeValue, dominantDimensionIndex: number) {
      this.unswappedHC = unswappedHC;

      this.dominantDimensionIndex = dominantDimensionIndex;
    }

    async dimensions() {
      return Promise.resolve(getDefined(this._dimensions));
    }

    setDimensions(dimensions: Dimension[]) {
      this._dimensions = dimensions;
    }

    async lowLevelGet(...indices: number[]) {
      return this.unswappedHC.lowLevelGet(
        ...undoChooseFirst(this.dominantDimensionIndex, indices)
      );
    }
  }
);

export const createSwappedDimensions = async (
  unswappedHC: ColumnLikeValue,
  dominantDimensionIndex: number
): Promise<MinimalTensor & ColumnLikeValue> => {
  const swapped = new SwappedDimensions(unswappedHC, dominantDimensionIndex);
  swapped.setDimensions(
    chooseFirst(dominantDimensionIndex, await unswappedHC.dimensions())
  );
  return swapped;
};
