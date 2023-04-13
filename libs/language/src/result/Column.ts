/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { ColumnLike } from '@decipad/column';
import { DeepReadonly } from 'utility-types';
import { Comparable } from '../compare';

export type { Comparable };

export type ColumnLikeResult<T = Comparable> = ColumnLike<T>;

export class Column<T = Comparable> implements ColumnLike<T> {
  readonly _values: DeepReadonly<T[]>;

  constructor(values: T[]) {
    this._values = values as DeepReadonly<T[]>;
  }
  atIndex(i: number): T {
    return getDefined(this.values[i] as T, `index ${i} out of bounds`);
  }

  get values() {
    return this._values;
  }
  get rowCount() {
    return this._values.length;
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  public static fromValues<T extends Comparable>(values: T[]): Column<T> {
    return new Column(values);
  }
}
