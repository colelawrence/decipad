import type { PromiseOrType } from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { getResultGenerator } from '../utils/getResultGenerator';

export type WriteSerializedColumnEncoder<
  T extends Result.OneResult = Result.OneResult
> = (buffer: DataView, offset: number, value: T) => PromiseOrType<number>; // returns the number of bytes written

export class WriteSerializedColumn<T extends Result.OneResult>
  implements Value.ColumnLikeValue
{
  private encoder: WriteSerializedColumnEncoder<T>;
  private source: Value.ColumnLikeValue;

  constructor(
    encoder: WriteSerializedColumnEncoder<T>,
    source: Value.ColumnLikeValue
  ) {
    this.encoder = encoder;
    this.source = source;
  }
  values(start?: number, end?: number) {
    return this.source.values(start, end);
  }
  async atIndex(i: number) {
    return this.source.atIndex(i);
  }
  async rowCount() {
    return this.source.rowCount();
  }
  async getData(): Promise<Result.OneResult> {
    return this.source.getData();
  }
  async lowLevelGet(...keys: number[]) {
    return this.source.lowLevelGet(...keys);
  }
  async dimensions() {
    return this.source.dimensions();
  }
  async serialize(
    buffer: DataView,
    initialOffset = 0,
    start = 0,
    end = Infinity
  ): Promise<number> {
    const data = getResultGenerator(await this.source.getData());

    let offset = initialOffset + 4; // reserve space for the length
    let count = 0;
    for await (const value of data(start, end)) {
      count += 1;
      offset = await this.encoder(buffer, offset, value as T);
    }
    buffer.setUint32(initialOffset, count); // write the length (in number of elements)

    return offset;
  }
}
