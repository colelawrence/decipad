import { empty, generate } from '@decipad/generator-utils';
import { getDefined } from '@decipad/utils';
import type { ColumnLike } from './ColumnLike';

/* eslint-disable no-underscore-dangle */
export class MappedColumn<TValue, TColumn extends ColumnLike<TValue>>
  implements ColumnLike<TValue>
{
  readonly map: number[];
  readonly source: TColumn;

  constructor(col: TColumn, map: number[]) {
    this.source = col;
    this.map = map;
  }

  values(start = 0, end = Infinity): AsyncGenerator<TValue> {
    if (this.map.length < 1) {
      return empty();
    }
    let index = start - 1;
    const stopAt = Math.min(this.map.length, end) - 1;
    if (index > stopAt) {
      return empty();
    }
    return generate(async (done) => {
      index += 1;
      if (index > stopAt) {
        return done;
      }
      const pos = getDefined(this.map[index], `no map at position ${index}`);
      return this.source.atIndex(pos) as TValue;
    });
  }

  async rowCount() {
    return Math.min(this.map.length, await this.source.rowCount());
  }

  async atIndex(index: number) {
    const pos = this.map[index];
    if (pos == null) {
      return undefined;
    }
    return this.source.atIndex(pos);
  }

  static fromColumnAndMap<TV, TC extends ColumnLike<TV>>(
    column: TC,
    map: number[]
  ): MappedColumn<TV, TC> {
    return new MappedColumn(column, map);
  }
}
