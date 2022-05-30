/* eslint-disable no-underscore-dangle */
import { ColumnLike, Comparable } from './Column';

export class MappedColumn<T = Comparable> implements ColumnLike<T> {
  private map: number[];
  source: ColumnLike<T>;

  constructor(col: ColumnLike<T>, map: number[]) {
    this.source = col;
    this.map = map;
  }
  getData(): T[] {
    return this.values;
  }

  get values(): T[] {
    const { values } = this.source;
    return this.map.map((index) => values[index]);
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
