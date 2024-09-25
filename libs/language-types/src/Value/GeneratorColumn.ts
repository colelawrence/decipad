import {
  count,
  firstOrUndefined,
  from,
  fromGeneratorPromise,
  memoizing,
  slice,
  trace,
} from '@decipad/generator-utils';
import { isColumnLike } from './ColumnLike';
import type { ValueGeneratorFunction } from './ValueGenerator';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { lowLevelGet } from './lowLevelGet';
import type { PromiseOrType } from '@decipad/utils';
import { getDefined, once } from '@decipad/utils';
import { getResultGenerator } from '../utils/getResultGenerator';
import { lowLowLevelGet } from './lowLowLevelGet';
import { ColumnBase } from './ColumnBase';
import type { Dimension, Result, Value } from '@decipad/language-interfaces';
import { ResultMetadataColumn } from 'libs/language-interfaces/src/Result';

type TGeneratorColumn = Value.ColumnLikeValue & Value.LowLevelMinimalTensor;

const MAX_GENERATOR_MEMO_ELEMENTS = Infinity;

export class GeneratorColumn extends ColumnBase implements TGeneratorColumn {
  private gen: PromiseOrType<ValueGeneratorFunction>;
  private memo: undefined | Array<Value.Value>;
  private partialMemo: undefined | boolean;
  private desc: string;

  public meta: undefined | (() => undefined | ResultMetadataColumn);

  constructor(
    gen: PromiseOrType<ValueGeneratorFunction>,
    meta: undefined | (() => ResultMetadataColumn | undefined),
    desc: string
  ) {
    super();
    this.gen = gen;
    this.meta = meta;
    this.desc = desc;
  }

  async getDimensions(): Promise<Dimension[]> {
    const contents = await firstOrUndefined((await this.gen)());

    return [
      { dimensionLength: once(async () => this.rowCount()) },
      ...(isColumnLike(contents) ? await contents.dimensions() : []),
    ];
  }

  async getGetData(): Promise<Result.OneResult> {
    return columnValueToResultValue(this);
  }

  private async at(index: number): Promise<Result.OneResult | undefined> {
    return firstOrUndefined(
      getResultGenerator(await this.getData())(index, index + 1)
    );
  }

  async lowLowLevelGet(...keys: number[]) {
    return lowLowLevelGet(await this.at(keys[0]), keys.slice(1));
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async atIndex(i: number): Promise<Value.Value | undefined> {
    if (this.memo && i < this.memo.length) {
      return this.memo[i];
    }
    return firstOrUndefined(this.values(i, i + 1));
  }
  async getRowCount(): Promise<number> {
    if (this.memo) {
      return this.memo.length;
    }
    return count(this.values());
  }

  values(start = 0, end = Infinity) {
    return fromGeneratorPromise(this.asyncValues(start, end));
  }

  private async asyncValues(start = 0, end = Infinity) {
    if (
      this.memo != null &&
      (end < this.memo.length || !getDefined(this.partialMemo))
    ) {
      return trace(slice(from(this.memo), start, end), this.desc);
    }
    return trace(
      slice(
        memoizing(
          (await this.gen)(),
          (all, partial) => {
            this.memo = all;
            this.partialMemo = partial;
          },
          MAX_GENERATOR_MEMO_ELEMENTS
        ),
        start,
        end
      ),
      this.desc
    );
  }

  static fromGenerator(
    gen: (start?: number, end?: number) => AsyncGenerator<Value.Value>,
    meta: undefined | (() => ResultMetadataColumn | undefined),
    desc: string
  ) {
    return new GeneratorColumn(gen, meta, desc);
  }
}
