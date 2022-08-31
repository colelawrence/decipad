import { getOnly } from '@decipad/utils';
import type { Value } from '../interpreter/Value';
import { implementColumnLike } from './implementColumnLike';
import type { Dimension, MinimalHypercube } from './types';

type FromIndexFn = (index: number) => Value;

/**
 */
export const ComputedList = implementColumnLike(
  class ComputedList implements MinimalHypercube {
    readonly fn: FromIndexFn;
    dimensions: Dimension[];

    constructor(fn: FromIndexFn, length: number) {
      this.fn = fn;
      this.dimensions = [{ dimensionLength: length }];
    }

    lowLevelGet(...keys: number[]): Value {
      const index = getOnly(keys);
      return this.fn(index);
    }
  }
);
