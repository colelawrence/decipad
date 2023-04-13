import { DeepReadonly } from 'utility-types';
import { ColumnLike } from './ColumnLike';

export class ColumnSlice<TValue> implements ColumnLike<TValue> {
  readonly begin: number;
  readonly end: number;
  readonly sourceColumn: ColumnLike<TValue>;
  private memo: DeepReadonly<TValue[]> | undefined;

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

  get values() {
    if (!this.memo) {
      const { values } = this.sourceColumn;
      this.memo = values.slice(this.begin, this.end) as DeepReadonly<TValue[]>;
    }
    return this.memo;
  }

  atIndex(i: number) {
    return this.values[i] as TValue | undefined;
  }

  get rowCount() {
    return this.values.length;
  }
}
