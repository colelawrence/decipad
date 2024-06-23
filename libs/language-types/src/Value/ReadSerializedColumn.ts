/* eslint-disable no-underscore-dangle */
import {
  count,
  firstOrUndefined,
  from,
  fromGeneratorPromise,
  map,
  memoizing,
  slice,
} from '@decipad/generator-utils';
import type { PromiseOrType } from '@decipad/utils';
import type {
  Dimension,
  Result,
  SerializedType,
  Value,
} from '@decipad/language-interfaces';
import { typedResultToValue } from '../utils/typedResultToValue';
import { deserializeType } from '../Type';
import { lowLevelGet } from './lowLevelGet';
import { getResultGenerator } from '../utils/getResultGenerator';

export type ReadSerializedColumnDecoder<
  T extends Result.OneResult = Result.OneResult
> = (buffer: DataView, offset: number) => PromiseOrType<[T, number]>; // returns the decoded value and the next offset

export class ReadSerializedColumn<T extends Result.OneResult>
  implements Value.ColumnLikeValue
{
  private typedResultToValue: Promise<
    (result: Result.OneResult) => Value.Value
  >;
  private decode: ReadSerializedColumnDecoder<T>;
  private buffer: DataView;
  private _dimensions: Dimension[];
  private _allData: T[] | undefined;
  private initialOffset;

  constructor(
    type: SerializedType,
    decode: ReadSerializedColumnDecoder<T>,
    buffer: DataView,
    dimensions: Dimension[],
    initialOffset: number
  ) {
    this.typedResultToValue = typedResultToValue(deserializeType(type));
    this.decode = decode;
    this.buffer = buffer;
    this._dimensions = dimensions;
    this.initialOffset = initialOffset;
  }
  async getData(): Promise<Result.GenericResultGenerator<T>> {
    return (start = 0, end = Infinity) => {
      return slice(this.allDataNow(), start, end);
    };
  }

  private allDataNow(): AsyncGenerator<T> {
    const { buffer, decode, initialOffset } = this;
    if (this._allData) {
      return from(this._allData);
    }
    return memoizing(
      (async function* serializedColumnAllData() {
        const maxCount = buffer.getUint32(initialOffset);
        let offset = initialOffset + 4;
        let count = 0;
        while (count < maxCount) {
          count += 1;
          // eslint-disable-next-line no-await-in-loop
          const [value, newOffset] = await decode(buffer, offset);
          offset = newOffset;
          yield value;
        }
      })(),
      (all) => {
        this._allData = all;
      }
    );
  }

  async lowLevelGet(...keys: number[]): Promise<Value.Value> {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions(): Promise<Dimension[]> {
    return Promise.resolve(this._dimensions);
  }

  values(
    start?: number | undefined,
    end?: number | undefined
  ): AsyncGenerator<Value.Value> {
    return fromGeneratorPromise(
      (async () =>
        map(
          await getResultGenerator(await this.getData())(start, end),
          await this.typedResultToValue
        ))()
    );
  }

  async atIndex(i: number): Promise<Value.Value | undefined> {
    const v = await firstOrUndefined(slice(this.allDataNow(), i, i + 1));
    if (v != null) {
      return (await this.typedResultToValue)(v);
    }
    return v;
  }

  rowCount(): number | Promise<number> {
    return count(this.allDataNow());
  }
}
