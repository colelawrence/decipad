import {
  count,
  first,
  firstOrUndefined,
  from,
  fromGeneratorPromise,
  map,
  memoizing,
  slice,
  trace,
} from '@decipad/generator-utils';
import type {
  Dimension,
  Result,
  SerializedType,
  Value,
} from '@decipad/language-interfaces';
import { isColumnLike } from './ColumnLike';
import { lowLevelGet } from './lowLevelGet';
import type { PromiseOrType } from '@decipad/utils';
import { getDefined, once } from '@decipad/utils';
import { buildResult } from '../utils/buildResult';
import { lowLowLevelGet } from './lowLowLevelGet';
import { ColumnBase } from './ColumnBase';
import { resultToValue } from '../utils/resultToValue';

type TLeanColumn = Value.ColumnLikeValue & Value.LowLevelMinimalTensor;

const MAX_GENERATOR_MEMO_ELEMENTS = Infinity;

/**
 * A column result that takes a generator as the values.
 *
 * This is useful because you never need to have all the values in memory
 * at once.
 */
export class LeanColumn extends ColumnBase implements TLeanColumn {
  private gen: PromiseOrType<Result.ResultGenerator>;
  private type: SerializedType;
  public meta: undefined | (() => Result.ResultMetadataColumn);
  private memo: undefined | Array<Value.Value>;
  private partialMemo: undefined | boolean;
  private desc: string;

  constructor(
    gen: PromiseOrType<Result.ResultGenerator>,
    type: SerializedType,
    meta: undefined | (() => Result.ResultMetadataColumn),
    desc: string
  ) {
    super();
    this.gen = gen;
    this.type = type;
    this.meta = meta;
    this.desc = desc;
  }
  async getDimensions(): Promise<Dimension[]> {
    const contents = await firstOrUndefined((await this.gen)());

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: once(async () => this.rowCount()) },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: once(async () => this.rowCount()) }];
    }
  }

  async getGetData(): Promise<Result.OneResult> {
    return this.gen;
  }

  async lowLowLevelGet(...keys: number[]): Promise<Result.OneResult> {
    return lowLowLevelGet(await this.at(keys[0]), keys.slice(1));
  }

  private async at(index: number): Promise<Result.OneResult | undefined> {
    return first((await this.gen)(index, index + 1));
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
    return count(this.values());
  }

  values(start = 0, end = Infinity) {
    return fromGeneratorPromise(this.asyncValues(start, end));
  }

  private async asyncValues(
    start = 0,
    end = Infinity
  ): Promise<AsyncGenerator<Value.Value>> {
    if (
      this.memo != null &&
      (end < this.memo.length || !getDefined(this.partialMemo))
    ) {
      return trace(slice(from(this.memo), start, end), this.desc);
    }
    return trace(
      slice(
        memoizing(
          map((await this.gen)(), (r) =>
            resultToValue(buildResult(this.type, r))
          ),
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

  static fromGeneratorAndType(
    gen: (start?: number, end?: number) => AsyncGenerator<Result.OneResult>,
    type: SerializedType,
    meta: undefined | (() => Result.ResultMetadataColumn),
    desc = `LeanColumn.fromGeneratorAndType(${gen.name}, ${type.kind})`
  ) {
    return new LeanColumn(gen, type, meta, desc);
  }
}
