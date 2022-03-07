import { chooseFirst } from '../dimtools/common';
import { implementColumnLike } from './implementColumnLike';
import {
  Dimension,
  DimensionId,
  HypercubeLike,
  MinimalHypercube,
} from './types';

/**
 * Swaps a dimension like so (pseudocode):
 *
 * > unswappedHC
 * [
 *   [1, 2, 3],
 *   [4, 5, 6]
 * ]
 *
 * > swappedHC = new SwappedHypercube(unswappedHC, 1)
 * > swappedHC
 * [
 *   [1, 4],
 *   [2, 5],
 *   [3, 6],
 * ]
 */
export const SwappedHypercube = implementColumnLike(
  class SwappedHypercube implements MinimalHypercube {
    unswappedHC: HypercubeLike;

    dimensions: Dimension[];
    dominantDimensionIndex: number;

    constructor(unswappedHC: HypercubeLike, dominantDimensionId: DimensionId) {
      this.unswappedHC = unswappedHC;

      this.dominantDimensionIndex = unswappedHC.dimensions.findIndex(
        (dim) => dominantDimensionId === dim.dimensionId
      );
      this.dimensions = chooseFirst(
        this.dominantDimensionIndex,
        unswappedHC.dimensions
      );
    }

    lowLevelGet(...indices: number[]) {
      return this.unswappedHC.lowLevelGet(
        ...chooseFirst(this.dominantDimensionIndex, indices)
      );
    }
  }
);
