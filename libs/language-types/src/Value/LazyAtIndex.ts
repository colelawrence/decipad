import { getDefined } from '@decipad/utils';
import type { ColumnLikeValue } from './ColumnLike';
import { values } from '../utils/values';
import type { Value } from './Value';
import type { OneResult } from '../Result';
import type { LowLevelMinimalTensor } from './LowLevelMinimalTensor';
import { isLowLevelMinimalTensor } from '../utils/isLowLevelMinimalTensor';
import { getDimensionLength } from '../utils/getDimensionLength';
import { projectHypercube } from '../utils/projectHypercube';

type TLazyAtIndex = ColumnLikeValue & LowLevelMinimalTensor;

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
class LazyAtIndex implements TLazyAtIndex {
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

  async lowLowLevelGet(...indices: number[]): Promise<OneResult> {
    return isLowLevelMinimalTensor(this.innerHC)
      ? this.innerHC.lowLowLevelGet(this.index, ...indices)
      : (await this.innerHC.lowLevelGet(this.index, ...indices)).getData();
  }

  values(start = 0, end = Infinity): AsyncGenerator<Value> {
    return values(this, start, end);
  }

  async rowCount() {
    const firstDim = getDefined(
      (await this.dimensions())[0],
      'panic: getting row count from non-dimensional value'
    );
    return getDimensionLength(firstDim.dimensionLength);
  }

  async atIndex(i: number): Promise<Value> {
    if ((await this.dimensions()).length === 1) {
      return this.lowLevelGet(i);
    } else {
      return createLazyAtIndex(this, i);
    }
  }

  async getData(): Promise<OneResult> {
    return projectHypercube(this);
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
