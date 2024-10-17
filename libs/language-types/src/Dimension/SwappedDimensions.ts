/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import type { Value, Dimension } from '@decipad/language-interfaces';
import { implementColumnLike } from '../utils';
import type { MinimalTensor } from '../Value';
import { chooseFirst, undoChooseFirst } from './chooseFirst';

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
  class SwappedDimensions implements Value.LowLevelMinimalTensor {
    unswappedHC: Value.ColumnLikeValue;

    _dimensions: Dimension[] | undefined;
    dominantDimensionIndex: number;

    constructor(
      unswappedHC: Value.ColumnLikeValue,
      dominantDimensionIndex: number
    ) {
      this.unswappedHC = unswappedHC;

      this.dominantDimensionIndex = dominantDimensionIndex;
    }

    get meta() {
      return this.unswappedHC.meta?.bind(this.unswappedHC);
    }

    set meta(meta) {
      this.unswappedHC.meta = meta;
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

    async lowLowLevelGet(...indices: number[]) {
      return this.unswappedHC.lowLowLevelGet(
        ...undoChooseFirst(this.dominantDimensionIndex, indices)
      );
    }
  }
);

export const createSwappedDimensions = async (
  unswappedHC: Value.ColumnLikeValue,
  dominantDimensionIndex: number
): Promise<MinimalTensor & Value.ColumnLikeValue> => {
  const swapped = new SwappedDimensions(unswappedHC, dominantDimensionIndex);
  swapped.setDimensions(
    chooseFirst(dominantDimensionIndex, await unswappedHC.dimensions())
  );
  return swapped;
};
