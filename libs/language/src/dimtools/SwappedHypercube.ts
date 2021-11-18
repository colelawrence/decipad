import { Dimension, DimensionId, Hypercube, HypercubeLike } from './hypercube';

export const swapFirst = <T>(indexOnTop: number, items: T[]): T[] => {
  if (indexOnTop < 0) {
    throw new Error(
      `panic: SwappedHypercube could not find dimension with index ${indexOnTop}`
    );
  }

  const swapped = [
    items[indexOnTop],
    ...items.filter((_, i) => i !== indexOnTop),
  ];

  return swapped;
};

export class SwappedHypercube implements HypercubeLike {
  unswappedHC: Hypercube;

  dimensions: Dimension[];
  dominantDimensionIndex: number;

  constructor(unswappedHC: Hypercube, dominantDimensionId: DimensionId) {
    this.unswappedHC = unswappedHC;

    this.dominantDimensionIndex = unswappedHC.dimensions.findIndex(
      (dim) => dominantDimensionId === dim.dimensionId
    );
    this.dimensions = swapFirst(
      this.dominantDimensionIndex,
      unswappedHC.dimensions
    );
  }

  lowLevelGet(...indices: number[]) {
    return this.unswappedHC.lowLevelGet(
      ...swapFirst(this.dominantDimensionIndex, indices)
    );
  }
}
