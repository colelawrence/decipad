import { DeepReadonly } from 'utility-types';
import { ColumnLike } from './ColumnLike';

export class FilteredColumn<TValue> implements ColumnLike<TValue> {
  readonly map: boolean[];
  readonly sourceColumn: ColumnLike<TValue>;
  private memo: DeepReadonly<TValue[]> | undefined;

  constructor(col: ColumnLike<TValue>, map: boolean[]) {
    this.sourceColumn = col;
    this.map = map;
  }
  get values() {
    if (this.memo != null) {
      return this.memo;
    }
    this.memo = this.calculateValues();
    return this.memo;
  }

  private calculateValues(): DeepReadonly<TValue[]> {
    const { map } = this;
    let cursor = -1;
    const sourceValues = this.sourceColumn.values;
    return Array.from({ length: this.map.filter(Boolean).length }, () => {
      cursor += 1;
      while (!map[cursor]) {
        cursor += 1;
      }
      return sourceValues[cursor];
    }) as DeepReadonly<TValue[]>;
  }

  static fromColumnAndMap<TV>(
    column: ColumnLike<TV>,
    map: boolean[]
  ): FilteredColumn<TV> {
    return new FilteredColumn(column, map);
  }

  get rowCount() {
    let count = 0;
    for (const bool of this.map) {
      count += Number(bool);
    }
    return count;
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

    throw new Error(`panic: index not found: ${outwardIndex}`);
  }

  atIndex(wantedIndex: number) {
    return this.sourceColumn.values[this.getSourceIndex(wantedIndex)] as
      | TValue
      | undefined;
  }
}
