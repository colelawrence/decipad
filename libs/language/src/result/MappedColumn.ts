/* eslint-disable no-underscore-dangle */
import { ColumnLike, Comparable } from './Column';

export class MappedColumn<T = Comparable> implements ColumnLike<T> {
  private map: number[];
  source: ColumnLike<T>;
  private memo: T[] | undefined;

  constructor(col: ColumnLike<T>, map: number[]) {
    this.source = col;
    this.map = map;
  }
  getData(): T[] {
    return this.values;
  }

  get values(): T[] {
    if (!this.memo) {
      const { values } = this.source;
      this.memo = this.map.map((index) => values[index]);
    }
    return this.memo;
  }

  static fromColumnAndMap<T = Comparable>(
    column: ColumnLike<T>,
    map: number[]
  ): MappedColumn<T> {
    return new MappedColumn<T>(column, map);
  }

  get rowCount() {
    return Math.min(this.map.length, this.source.rowCount);
  }

  atIndex(index: number) {
    return this.source.atIndex(this.map[index]);
  }
}
