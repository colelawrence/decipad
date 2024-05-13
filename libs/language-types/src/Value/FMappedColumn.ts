import {
  count,
  firstOrUndefined,
  from,
  fromGeneratorPromise,
  map,
  memoizing,
  slice,
  trace,
} from '@decipad/generator-utils';
import type { GenericResultGenerator, OneResult } from '../Result';
import { isColumnLike, type ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import type { Dimension } from '../Dimension';
import { lowLevelGet } from './lowLevelGet';
import type { PromiseOrType } from '@decipad/utils';
import { getDefined, once } from '@decipad/utils';
import { getResultGenerator, resultToValue } from '../utils';
import type { SerializedType } from '../SerializedType';
import { buildResult } from '../utils/buildResult';
import type { LowLevelMinimalTensor } from './LowLevelMinimalTensor';
import { lowLowLevelGet } from './lowLowLevelGet';
import { ColumnBase } from './ColumnBase';

type TFMappedColumn = ColumnLikeValue & LowLevelMinimalTensor;

type MapFunction<T = OneResult> = (
  value: T,
  index: number,
  previous?: T
) => PromiseOrType<OneResult>;

const MAX_GENERATOR_MEMO_ELEMENTS = Infinity;

export class FMappedColumn<T = OneResult>
  extends ColumnBase
  implements TFMappedColumn
{
  private gen: PromiseOrType<GenericResultGenerator<T>>;
  private map: MapFunction<T>;
  private type: SerializedType;
  private memo: undefined | Array<Value>;
  private partialMemo: undefined | boolean;
  private desc: string;

  constructor(
    gen: PromiseOrType<GenericResultGenerator<T>>,
    type: SerializedType,
    map: MapFunction<T>,
    desc: string
  ) {
    super();
    this.gen = gen;
    this.type = type;
    this.map = map;
    this.desc = desc;
  }
  async getDimensions(): Promise<Dimension[]> {
    if (this.type.kind !== 'column') {
      return [{ dimensionLength: async () => this.rowCount() }];
    }
    const contents = await firstOrUndefined((await this.gen)());

    return [
      { dimensionLength: once(async () => this.rowCount()) },
      ...(isColumnLike(contents) ? await contents.dimensions() : []),
    ];
  }

  async getGetData(): Promise<OneResult> {
    const gen = await this.gen;
    return (start = 0, end = Infinity) =>
      trace(map(gen(start, end), this.map), this.desc);
  }

  private async at(index: number): Promise<OneResult | undefined> {
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

  async atIndex(i: number): Promise<Value | undefined> {
    if (this.memo && i < this.memo.length) {
      return this.memo[i];
    }
    return firstOrUndefined(this.values(i, i + 1));
  }

  async getRowCount() {
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
          map((await this.gen)(), async (r, i, previous) =>
            resultToValue(
              buildResult(this.type, await this.map(r, i, previous))
            )
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
    mapFn: MapFunction,
    desc: string
  ) {
    return new FMappedColumn(gen, type, mapFn, desc);
  }
}
