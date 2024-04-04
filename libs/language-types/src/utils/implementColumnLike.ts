import { getDefined } from '@decipad/utils';
import type { Class } from 'utility-types';
import type { ColumnLikeValue } from '../Value/ColumnLike';
import type { MinimalTensor } from '../Value/MinimalTensor';
import type { Value } from '../Value/Value';
import { createLazyAtIndex } from '../Value/LazyAtIndex';
import type { OneResult } from '../Result';
import { materialize } from './materialize';
import { values } from './values';

/**
 * Extend hypercube-like class `Cls` such that it implements the `ColumnLike` interface
 */
export function implementColumnLike<T extends Class<MinimalTensor>>(Cls: T) {
  return class ColumnLikeMixin extends Cls implements ColumnLikeValue {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
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
  };
}
