import { chooseFirst } from './common';
import { Dimension, DimensionId, HypercubeLike } from './hypercube';

export class SwappedHypercube implements HypercubeLike {
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
