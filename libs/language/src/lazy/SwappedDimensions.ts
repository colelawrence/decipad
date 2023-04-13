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
export const SwappedDimensions = implementColumnLike(
  class SwappedDimensions implements MinimalTensor {
    unswappedHC: ColumnLikeValue;

    dimensions: Dimension[];
    dominantDimensionIndex: number;

    constructor(unswappedHC: ColumnLikeValue, dominantDimensionIndex: number) {
      this.unswappedHC = unswappedHC;

      this.dominantDimensionIndex = dominantDimensionIndex;
      this.dimensions = chooseFirst(
        this.dominantDimensionIndex,
        unswappedHC.dimensions
      );
    }

    lowLevelGet(...indices: number[]) {
      return this.unswappedHC.lowLevelGet(
        ...undoChooseFirst(this.dominantDimensionIndex, indices)
      );
    }
  }
);
