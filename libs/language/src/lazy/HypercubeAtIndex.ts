import { HypercubeLike } from '.';
import { implementColumnLike } from './implementColumnLike';
import { MinimalHypercube } from './types';

/**
 * Used to turn a hypercube of an array into an array of the hypercubes inside
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
    innerHC: HypercubeLike;

    constructor(innerHC: HypercubeLike, index: number) {
      this.innerHC = innerHC;
      this.index = index;
    }

    get dimensions() {
      return this.innerHC.dimensions.slice(1);
    }

    lowLevelGet(...indices: number[]) {
      return this.innerHC.lowLevelGet(this.index, ...indices);
    }
  }
);
