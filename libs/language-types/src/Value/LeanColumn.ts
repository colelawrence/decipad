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
import type { OneResult, ResultGenerator } from '../Result';
import { isColumnLike, type ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import type { Dimension } from '../Dimension';
import { lowLevelGet } from './lowLevelGet';
import type { PromiseOrType } from '@decipad/utils';
import { getDefined, once } from '@decipad/utils';
import { resultToValue } from '../utils';
import type { SerializedType } from '../SerializedType';
import { buildResult } from '../utils/buildResult';
import type { LowLevelMinimalTensor } from './LowLevelMinimalTensor';
import { lowLowLevelGet } from './lowLowLevelGet';
import { ColumnBase } from './ColumnBase';

type TLeanColumn = ColumnLikeValue & LowLevelMinimalTensor;

const MAX_GENERATOR_MEMO_ELEMENTS = Infinity;

export class LeanColumn extends ColumnBase implements TLeanColumn {
  private gen: PromiseOrType<ResultGenerator>;
  private type: SerializedType;
  private memo: undefined | Array<Value>;
  private partialMemo: undefined | boolean;
  private desc: string;

  constructor(
    gen: PromiseOrType<ResultGenerator>,
    type: SerializedType,
    desc: string
  ) {
    super();
    this.gen = gen;
    this.type = type;
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

  async getGetData(): Promise<OneResult> {
    return this.gen;
  }

  async lowLowLevelGet(...keys: number[]): Promise<OneResult> {
    return lowLowLevelGet(await this.at(keys[0]), keys.slice(1));
  }

  private async at(index: number): Promise<OneResult | undefined> {
    return first((await this.gen)(index, index + 1));
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async atIndex(i: number): Promise<Value | undefined> {
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
  ): Promise<AsyncGenerator<Value>> {
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
    gen: (start?: number, end?: number) => AsyncGenerator<OneResult>,
    type: SerializedType,
    desc = `LeanColumn.fromGeneratorAndType(${gen.name}, ${type.kind})`
  ) {
    return new LeanColumn(gen, type, desc);
  }
}
