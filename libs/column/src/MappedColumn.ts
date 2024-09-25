import { all, empty, from } from '@decipad/generator-utils';
import { getDefined } from '@decipad/utils';
import type { ColumnLike } from './ColumnLike';

/* eslint-disable no-underscore-dangle */
export class MappedColumn<TValue, TColumn extends ColumnLike<TValue>>
  implements ColumnLike<TValue>
{
  readonly map: number[];
  readonly source: TColumn;
  private sourceValues: TValue[] | undefined;
  private memo: undefined | Array<TValue>;

  constructor(col: TColumn, map: number[]) {
    this.source = col;
    this.map = map;
  }

  private async getSourceValues() {
    if (this.sourceValues == null) {
      this.sourceValues = await all(this.source.values());
    }
    return this.sourceValues;
  }

  private internalValues(start = 0, end = Infinity): AsyncGenerator<TValue> {
    if (this.map.length < 1) {
      return empty();
    }
    let index = start - 1;
    const stopAt = Math.min(this.map.length, end) - 1;
    if (index > stopAt) {
      return empty();
    }
    const { map } = this;
    const getSourceValues = this.getSourceValues.bind(this);

    return (async function* generate() {
      const sourceValues = await getSourceValues();
      while (index < stopAt) {
        index += 1;
        const pos = getDefined(map[index], `no map at position ${index}`);
        yield sourceValues[pos];
      }
    })();
  }

  values(start = 0, end = Infinity): AsyncGenerator<TValue> {
    if (this.memo) {
      return from(this.memo.slice(start, end));
    }
    const setMemo = (m: TValue[]) => {
      this.memo = m;
    };
    const getInternalValues = this.internalValues.bind(this);
    return (async function* generate() {
      const every = await all(getInternalValues());
      setMemo(every);
      return yield* from(every.slice(start, end));
    })();
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
