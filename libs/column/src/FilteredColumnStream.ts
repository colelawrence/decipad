import type { ColumnLike } from './ColumnLike';

export class FilteredColumnStream<TValue> implements ColumnLike<TValue> {
  readonly map: ColumnLike<boolean>;
  readonly sourceColumn: ColumnLike<TValue>;

  constructor(col: ColumnLike<TValue>, map: ColumnLike<boolean>) {
    this.sourceColumn = col;
    this.map = map;
  }

  async *values(start = 0, end = Infinity) {
    let cursor = -1;

    const sourceGen = this.sourceColumn.values();
    for await (const b of this.map.values()) {
      const next = await sourceGen.next();
      if (b) {
        cursor += 1;
        if (cursor < start || cursor >= end) {
          continue;
        }
        yield next.value;
      }
      if (next.done || cursor >= end) {
        return;
      }
    }
  }

  static fromColumnAndMap<TV>(
    column: ColumnLike<TV>,
    map: ColumnLike<boolean>
  ): FilteredColumnStream<TV> {
    return new FilteredColumnStream(column, map);
  }

  async rowCount() {
    let rowCount = 0;
    for await (const b of this.map.values()) {
      if (b) {
        rowCount += 1;
      }
    }
    return rowCount;
  }

  async getSourceIndex(outwardIndex: number): Promise<number | undefined> {
    let insideCursor = -1;
    let outsideCursor = -1;
    for await (const b of this.map.values()) {
      insideCursor += 1;
      if (b) {
        outsideCursor += 1;
        if (outsideCursor === outwardIndex) {
          return insideCursor;
        }
      }
    }
    return -1;
  }

  async atIndex(wantedIndex: number): Promise<TValue | undefined> {
    const sourceIndex = await this.getSourceIndex(wantedIndex);
    if (sourceIndex == null) {
      return undefined;
    }
    return this.sourceColumn.atIndex(sourceIndex);
  }
}
