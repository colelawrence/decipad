/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { DeepReadonly } from 'utility-types';
import DeciNumber, { DeciNumberInput } from '@decipad/number';
import { ColumnLike } from './ColumnLike';

export type Comparable =
  | string
  | boolean
  | number
  | bigint
  | symbol
  | DeciNumber
  | DeciNumberInput
  | ReadonlyArray<Comparable>;

export type ColumnLikeResult<T extends Comparable = Comparable> = ColumnLike<T>;

export class Column<T extends Comparable> implements ColumnLike<T> {
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
  public static fromValues<V extends Comparable>(values: V[]): Column<V> {
    return new Column(values);
  }
}
