import {
  count,
  firstOrUndefined,
  fromGeneratorPromise,
  map,
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
import { once } from '@decipad/utils';
import { buildResult } from '../utils/buildResult';
import { lowLowLevelGet } from './lowLowLevelGet';
import { ColumnBase } from './ColumnBase';
import { getResultGenerator } from '../utils/getResultGenerator';
import { resultToValue } from '../utils/resultToValue';

type TFMappedColumn = Value.ColumnLikeValue & Value.LowLevelMinimalTensor;

type MapFunction<T = Result.OneResult> = (
  value: T,
  index: number,
  previous?: T
) => PromiseOrType<Result.OneResult>;

export class FMappedColumn<T = Result.OneResult>
  extends ColumnBase
  implements TFMappedColumn
{
  private gen: PromiseOrType<Result.GenericResultGenerator<T>>;
  private map: MapFunction<T>;
  private type: SerializedType;
  private desc: string;

  public meta: undefined | (() => Result.ResultMetadataColumn | undefined);

  constructor(
    gen: PromiseOrType<Result.GenericResultGenerator<T>>,
    type: SerializedType,
    map: MapFunction<T>,
    meta: undefined | (() => Result.ResultMetadataColumn | undefined),
    desc: string
  ) {
    super();
    this.gen = gen;
    this.type = type;
    this.map = map;
    this.meta = meta;
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

  async getGetData(): Promise<Result.OneResult> {
    const gen = await this.gen;
    return (start = 0, end = Infinity) =>
      trace(map(gen(start, end), this.map), this.desc);
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
  ): Promise<AsyncGenerator<Value.Value>> {
    return trace(
      map((await this.gen)(start, end), async (r, i, previous) =>
        resultToValue(
          buildResult(this.type, await this.map(r, i, previous), this.meta)
        )
      ),
      this.desc
    );
  }

  static fromGeneratorAndType(
    gen: (start?: number, end?: number) => AsyncGenerator<Result.OneResult>,
    type: SerializedType,
    mapFn: MapFunction,
    meta: undefined | (() => Result.ResultMetadataColumn | undefined),
    desc: string
  ) {
    return new FMappedColumn(gen, type, mapFn, meta, desc);
  }
}
