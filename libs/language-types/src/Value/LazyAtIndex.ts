import { getDefined } from '@decipad/utils';
import { materialize } from '../utils/materialize';
import type { ColumnLikeValue } from './ColumnLike';
import { values } from '../utils/values';
import type { Value } from './Value';
import type { OneResult } from '../Result';

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
class LazyAtIndex implements ColumnLikeValue {
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

  async getData(): Promise<OneResult> {
    return materialize(this);
  }
}

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
