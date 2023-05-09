import { getDefined } from '@decipad/utils';
import { Class } from 'utility-types';
import { ColumnLikeValue, Value } from '../value';
import { MinimalTensor } from './types';
import { materialize } from './materialize';
import { Result } from '..';

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
const LazyAtIndex = implementColumnLike(
  class LazyAtIndex implements MinimalTensor {
    index: number;
    innerHC: ColumnLikeValue;

    constructor(innerHC: ColumnLikeValue, index: number) {
      this.innerHC = innerHC;
      this.index = index;
    }

    async dimensions() {
      return (await this.innerHC.dimensions()).slice(1);
    }

    setDimensions() {
      throw new Error('not implemented');
    }

    async lowLevelGet(...indices: number[]) {
      return this.innerHC.lowLevelGet(this.index, ...indices);
    }
  }
);

export const createLazyAtIndex = async (
  innerHC: ColumnLikeValue,
  index: number
): Promise<ColumnLikeValue> => {
  const { dimensionLength } = (await innerHC.dimensions())[0];
  if (index < 0 || index >= dimensionLength) {
    throw new Error(`panic: index ${index} out of bounds`);
  }
  return new LazyAtIndex(innerHC, index);
};

async function* values(self: ColumnLikeValue, start = 0, end = Infinity) {
  const rowCount = Math.min(await self.rowCount(), end);
  for (let index = start; index < rowCount; index++) {
    // eslint-disable-next-line no-await-in-loop
    yield (await self.atIndex(index)) as Value;
  }
}

/**
 * Extend hypercube-like class `Cls` such that it implements the `ColumnLike` interface
 */
export function implementColumnLike<T extends Class<MinimalTensor>>(Cls: T) {
  return class ColumnLikeMixin extends Cls implements ColumnLikeValue {
    values(start = 0, end = Infinity): AsyncGenerator<Value> {
      return values(this, start, end);
    }

    async rowCount() {
      const firstDim = getDefined(
        (await this.dimensions())[0],
        'panic: getting row count from non-dimensional value'
      );
      return firstDim.dimensionLength;
    }

    async atIndex(i: number): Promise<Value> {
      if ((await this.dimensions()).length === 1) {
        return this.lowLevelGet(i);
      } else {
        return createLazyAtIndex(this, i);
      }
    }

    async getData(): Promise<Result.OneResult> {
      return materialize(this);
    }
  };
}
