/* eslint-disable no-underscore-dangle */
import { ColumnLike } from '@decipad/column';
import { from } from '@decipad/generator-utils';
import { Comparable } from '../compare';

export type { Comparable };

export type ColumnLikeResult<T = Comparable> = ColumnLike<T>;

export class Column<T = Comparable> implements ColumnLike<T> {
  readonly _values: ReadonlyArray<T>;

  constructor(values: T[]) {
    this._values = values as ReadonlyArray<T>;
  }
  async atIndex(i: number) {
    return Promise.resolve(this._values[i] as T);
  }

  values(start = 0, end = Infinity) {
    return from(this._values.slice(start, end));
  }
  async rowCount() {
    return Promise.resolve(this._values.length);
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  public static fromValues<T extends Comparable>(values: T[]): Column<T> {
    return new Column(values);
  }
}
