import { getDefined } from '@decipad/utils';
import { Column } from '..';
import { Value } from '../interpreter';
import { OneResult } from '../interpreter/interpreter-types';
import { getInstanceof } from '../utils';
import { chooseFirst } from './common';
import { Dimension, DimensionId, HypercubeLike } from './hypercube';
import { materialize, materializeToValue } from './materialize';

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

  get values(): readonly Value[] {
    return getInstanceof(materializeToValue(this), Column).values;
  }

  get rowCount() {
    return this.dimensions[0].dimensionLength;
  }

  atIndex(i: number) {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }

  getData(): OneResult {
    return materialize(this);
  }
}
