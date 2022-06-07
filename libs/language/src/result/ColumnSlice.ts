import { RuntimeError } from '../interpreter';
import { Comparable } from '../interpreter/compare-values';
import { ColumnLike } from './Column';

export class ColumnSlice<T = Comparable> implements ColumnLike<T> {
  private begin: number;
  private end: number;
  private source: ColumnLike<T>;
  private memo: T[] | undefined;
  rowCount: number;

  constructor(col: ColumnLike<T>, begin: number, end: number) {
    if (end < begin) {
      throw new RuntimeError('end < begin');
    }
    this.begin = begin;
    this.end = end;
    this.source = col;
    this.rowCount = end - begin;
  }
  atIndex(i: number): T {
    return this.source.atIndex(i + this.begin);
  }
  getData(): T[] {
    return this.values;
  }

  get values(): T[] {
    if (!this.memo) {
      this.memo = this.source.values.slice(this.begin, this.end);
    }
    return this.memo;
  }

  static fromColumnAndRange(
    col: ColumnLike,
    begin: number,
    end: number
  ): ColumnLike {
    return new ColumnSlice(col, begin, end);
  }
}
