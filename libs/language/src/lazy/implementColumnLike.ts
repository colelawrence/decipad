import { getDefined } from '@decipad/utils';
import { Class } from 'utility-types';
import { OneResult } from '../interpreter/interpreter-types';
import type { ColumnLike, Value } from '../value';
import { HypercubeAtIndex } from './HypercubeAtIndex';
import { materialize } from './materialize';
import { MinimalHypercube } from './types';

/**
 * Extend hypercube-like class `Cls` such that it implements the `ColumnLike` interface
 */
export function implementColumnLike<T extends Class<MinimalHypercube>>(Cls: T) {
  return class ColumnLikeMixin extends Cls implements ColumnLike {
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
        return new HypercubeAtIndex(this, i);
      }
    }

    getData(): OneResult {
      return materialize(this);
    }
  };
}
