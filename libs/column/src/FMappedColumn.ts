import { map } from '@decipad/generator-utils';
import type { ColumnLike } from './ColumnLike';

type MapFunction<TValue> = (value: TValue, index: number) => Promise<TValue>;

/* eslint-disable no-underscore-dangle */
export class FMappedColumn<TValue> implements ColumnLike<TValue> {
  readonly map: MapFunction<TValue>;
  readonly source: ColumnLike<TValue>;

  constructor(col: ColumnLike<TValue>, mapF: MapFunction<TValue>) {
    this.source = col;
    this.map = mapF;
  }

  values(start = 0, end = Infinity): AsyncGenerator<TValue> {
    return map(this.source.values(start, end), this.map);
  }

  async rowCount() {
    return this.source.rowCount();
  }

  async atIndex(index: number) {
    return this.map((await this.source.atIndex(index)) as TValue, index);
  }

  static fromColumnAndMap<TV>(
    column: ColumnLike<TV>,
    mapF: MapFunction<TV>
  ): FMappedColumn<TV> {
    return new FMappedColumn(column, mapF);
  }
}
