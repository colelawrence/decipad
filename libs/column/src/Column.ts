/* eslint-disable no-underscore-dangle */
import DeciNumber, { DeciNumberInput } from '@decipad/number';
import { from } from '@decipad/generator-utils';
import { ColumnLike } from './ColumnLike';

export type Comparable =
  | string
  | boolean
  | number
  | bigint
  | symbol
  | undefined
  | DeciNumber
  | DeciNumberInput
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
  | ReadonlyArray<Comparable>;

export type ColumnLikeResult<T extends Comparable = Comparable> = ColumnLike<T>;

export class Column<T extends Comparable> implements ColumnLike<T> {
  readonly _values: ReadonlyArray<T>;

  constructor(values: T[]) {
    this._values = values as ReadonlyArray<T>;
  }
  atIndex(i: number): Promise<T | undefined> {
    return Promise.resolve(this._values[i]);
  }

  values(start = 0, end = Infinity) {
    return from(this._values.slice(start, end));
  }
  rowCount() {
    return Promise.resolve(this._values.length);
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  public static fromValues<V extends Comparable>(values: V[]): Column<V> {
    return new Column(values);
  }
}
