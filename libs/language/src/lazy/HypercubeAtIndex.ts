import { ColumnLike } from '../value';
import { implementColumnLike } from './implementColumnLike';
import { MinimalHypercube } from './types';

/**
 * Used to lazily lookup into a hypercube
 *
 * hc // -> [
 *   [1, 2],
 *   [69, 420]
 * ]
 *
 * new HypercubeAtIndex(hc, 1) // -> [69, 420]
 */
export const HypercubeAtIndex = implementColumnLike(
  class HypercubeAtIndex implements MinimalHypercube {
    index: number;
    innerHC: ColumnLike;

    constructor(innerHC: ColumnLike, index: number) {
      this.innerHC = innerHC;
      this.index = index;

      const { dimensionLength } = this.innerHC.dimensions[0];
      if (index < 0 || index >= dimensionLength) {
        throw new Error(`panic: index ${index} out of bounds`);
      }
    }

    get dimensions() {
      return this.innerHC.dimensions.slice(1);
    }

    lowLevelGet(...indices: number[]) {
      return this.innerHC.lowLevelGet(this.index, ...indices);
    }
  }
);
