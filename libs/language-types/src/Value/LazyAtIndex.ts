import { getDefined } from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { values } from '../utils/values';
import { isLowLevelMinimalTensor } from '../utils/isLowLevelMinimalTensor';
import { getDimensionLength } from '../utils/getDimensionLength';
import { projectHypercube } from '../utils/projectHypercube';

type TLazyAtIndex = Value.ColumnLikeValue & Value.LowLevelMinimalTensor;

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
  innerHC: Value.ColumnLikeValue;
  meta: undefined | (() => undefined | Result.ResultMetadataColumn);

  constructor(
    innerHC: Value.ColumnLikeValue,
    index: number,
    meta: undefined | (() => Result.ResultMetadataColumn | undefined)
  ) {
    this.innerHC = innerHC;
    this.index = index;
    this.meta = meta;
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

  async lowLowLevelGet(...indices: number[]): Promise<Result.OneResult> {
    return isLowLevelMinimalTensor(this.innerHC)
      ? this.innerHC.lowLowLevelGet(this.index, ...indices)
      : (await this.innerHC.lowLevelGet(this.index, ...indices)).getData();
  }

  values(start = 0, end = Infinity): AsyncGenerator<Value.Value> {
    return values(this, start, end);
  }

  async rowCount() {
    const firstDim = getDefined(
      (await this.dimensions())[0],
      'panic: getting row count from non-dimensional value'
    );
    return getDimensionLength(firstDim.dimensionLength);
  }

  async atIndex(i: number): Promise<Value.Value> {
    if ((await this.dimensions()).length === 1) {
      return this.lowLevelGet(i);
    } else {
      return createLazyAtIndex(this, i, this.meta?.bind(this));
    }
  }

  async getData(): Promise<Result.OneResult> {
    return projectHypercube(this);
  }
}

export const createLazyAtIndex = async (
  innerHC: Value.ColumnLikeValue,
  index: number,
  meta: undefined | (() => Result.ResultMetadataColumn | undefined)
): Promise<Value.ColumnLikeValue> => {
  const { dimensionLength } = (await innerHC.dimensions())[0];
  if (index < 0 || index >= (await getDimensionLength(dimensionLength))) {
    throw new Error(`panic: index ${index} out of bounds`);
  }
  return new LazyAtIndex(innerHC, index, meta);
};
