import { filter, slice } from '@decipad/generator-utils';
import { ColumnLike } from './ColumnLike';

export class FilteredColumn<TValue> implements ColumnLike<TValue> {
  readonly map: boolean[];
  readonly sourceColumn: ColumnLike<TValue>;

  constructor(col: ColumnLike<TValue>, map: boolean[]) {
    this.sourceColumn = col;
    this.map = map;
  }

  values(start = 0, end = Infinity) {
    const { map } = this;
    let cursor = -1;
    return slice(
      filter(this.sourceColumn.values(), () => {
        cursor += 1;
        return map[cursor];
      }),
      start,
      end
    );
  }

  static fromColumnAndMap<TV>(
    column: ColumnLike<TV>,
    map: boolean[]
  ): FilteredColumn<TV> {
    return new FilteredColumn(column, map);
  }

  rowCount() {
    let count = 0;
    for (const bool of this.map) {
      if (bool) {
        count += 1;
      }
    }
    return Promise.resolve(count);
  }

  public getSourceIndex(outwardIndex: number) {
    let trueCount = -1;
    for (let sourceIndex = 0; sourceIndex < this.map.length; sourceIndex += 1) {
      if (this.map[sourceIndex] === true) {
        trueCount += 1;
        if (trueCount === outwardIndex) {
          return sourceIndex;
        }
      }
    }

    return -1;
  }

  atIndex(wantedIndex: number) {
    return this.sourceColumn.atIndex(this.getSourceIndex(wantedIndex));
  }
}
