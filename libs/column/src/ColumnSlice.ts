import { firstOrUndefined, slice } from '@decipad/generator-utils';
import { ColumnLike } from './ColumnLike';

export class ColumnSlice<TValue> implements ColumnLike<TValue> {
  readonly begin: number;
  readonly end: number;
  readonly sourceColumn: ColumnLike<TValue>;

  constructor(sourceColumn: ColumnLike<TValue>, begin: number, end: number) {
    this.sourceColumn = sourceColumn;
    this.begin = begin;
    this.end = end;
  }

  static fromColumnAndRange<TV>(
    column: ColumnLike<TV>,
    begin: number,
    end: number
  ) {
    return new ColumnSlice(column, begin, end);
  }

  values(start = 0, end = Infinity) {
    if (end < start) {
      throw new Error('skip needs to be >= start');
    }
    return slice(this.sourceColumn.values(this.begin, this.end), start, end);
  }

  atIndex(i: number) {
    return firstOrUndefined(this.values(i, i + 1));
  }

  async rowCount() {
    const sourceRowCount = await this.sourceColumn.rowCount();
    const start = Math.min(sourceRowCount, this.begin);
    const end = Math.min(sourceRowCount, this.end);
    return end - start;
  }
}
