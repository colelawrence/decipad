import { getDefined } from '@decipad/utils';
import { Class } from 'utility-types';
import { ColumnLikeValue, Value } from '../value';
import { MinimalTensor } from './types';
import { OneResult } from '../interpreter/interpreter-types';
import { materialize } from './materialize';

/**
 * Used to lazily lookup into a hypercube
 *
 * hc // -> [
 *   [1, 2],
 *   [69, 420]
 * ]
 *
 * new LazyAtIndex(hc, 1) // -> [69, 420]
 */
export const LazyAtIndex = implementColumnLike(
  class LazyAtIndex implements MinimalTensor {
    index: number;
    innerHC: ColumnLikeValue;

    constructor(innerHC: ColumnLikeValue, index: number) {
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

/**
 * Extend hypercube-like class `Cls` such that it implements the `ColumnLike` interface
 */
export function implementColumnLike<T extends Class<MinimalTensor>>(Cls: T) {
  return class ColumnLikeMixin extends Cls implements ColumnLikeValue {
    get values() {
      const values: Value[] = [];
      for (let index = 0; index < this.rowCount; index++) {
        values.push(this.atIndex(index));
      }
      return values;
    }

    get rowCount() {
      const firstDim = getDefined(
        this.dimensions[0],
        'panic: getting row count from non-dimensional value'
      );
      return firstDim.dimensionLength;
    }

    atIndex(i: number): Value {
      if (this.dimensions.length === 1) {
        return this.lowLevelGet(i);
      } else {
        return new LazyAtIndex(this, i);
      }
    }

    getData(): OneResult {
      return materialize(this);
    }
  };
}
