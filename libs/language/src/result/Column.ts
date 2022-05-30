/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { Comparable } from '../interpreter/compare-values';

export type { Comparable };

export interface ColumnLike<T = Comparable> {
  values: T[];
  atIndex(i: number): T;
  rowCount: number;
  getData(): T[];
}

export class Column<T = Comparable> implements ColumnLike<T> {
  readonly _values: T[];

  constructor(values: T[]) {
    this._values = values;
  }
  atIndex(i: number): T {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }
  getData(): T[] {
    return this.values;
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
  public static fromValues(values: Comparable[]): ColumnLike {
    return new Column(values);
  }
}
