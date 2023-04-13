import { DeepReadonly } from 'utility-types';
import { ColumnLike } from './ColumnLike';

/* eslint-disable no-underscore-dangle */
export class MappedColumn<TValue> implements ColumnLike<TValue> {
  readonly map: number[];
  readonly source: ColumnLike<TValue>;
  private memo: DeepReadonly<TValue[]> | undefined;

  constructor(col: ColumnLike<TValue>, map: number[]) {
    this.source = col;
    this.map = map;
  }

  get values() {
    if (!this.memo) {
      const { values } = this.source;
      this.memo = this.map.map((index) => values[index]) as DeepReadonly<
        TValue[]
      >;
    }
    return this.memo;
  }

  static fromColumnAndMap<TV>(
    column: ColumnLike<TV>,
    map: number[]
  ): MappedColumn<TV> {
    return new MappedColumn(column, map);
  }

  get rowCount() {
    return Math.min(this.map.length, this.source.rowCount);
  }

  atIndex(index: number) {
    return this.source.atIndex(this.map[index]);
  }
}
