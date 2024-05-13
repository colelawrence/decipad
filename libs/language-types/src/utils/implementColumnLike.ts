import type { PromiseOrType } from '@decipad/utils';
import { getDefined } from '@decipad/utils';
import type { Class } from 'utility-types';
import type { ColumnLikeValue } from '../Value/ColumnLike';
import type { MinimalTensor } from '../Value/MinimalTensor';
import type { Value } from '../Value/Value';
import { createLazyAtIndex } from '../Value/LazyAtIndex';
import type { OneResult } from '../Result';
import { values } from './values';
import { getDimensionLength } from './getDimensionLength';
import { projectHypercube } from './projectHypercube';

/**
 * Extend hypercube-like class `Cls` such that it implements the `ColumnLike` interface
 */
export function implementColumnLike<T extends Class<MinimalTensor>>(Cls: T) {
  return class ColumnLikeMixin extends Cls implements ColumnLikeValue {
    rowCountCache: undefined | PromiseOrType<number>;
    dataCache: undefined | Promise<OneResult>;
    values(start = 0, end = Infinity): AsyncGenerator<Value> {
      return values(this, start, end);
    }

    async rowCount() {
      if (!this.rowCountCache) {
        const firstDim = getDefined(
          (await this.dimensions())[0],
          'panic: getting row count from non-dimensional value'
        );
        this.rowCountCache = getDimensionLength(firstDim.dimensionLength);
      }
      return this.rowCountCache;
    }

    async atIndex(i: number): Promise<Value> {
      if ((await this.dimensions()).length === 1) {
        return this.lowLevelGet(i);
      } else {
        return createLazyAtIndex(this, i);
      }
    }

    async getData(): Promise<OneResult> {
      if (!this.dataCache) {
        this.dataCache = projectHypercube(this);
      }
      return this.dataCache;
    }
  };
}
