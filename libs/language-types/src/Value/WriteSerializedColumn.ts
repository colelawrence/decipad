import type { PromiseOrType } from '@decipad/utils';
import type { OneResult } from '../Result';
import { getResultGenerator } from '../utils/getResultGenerator';
import type { ColumnLikeValue } from './ColumnLike';

export type WriteSerializedColumnEncoder<T extends OneResult = OneResult> = (
  buffer: DataView,
  offset: number,
  value: T
) => PromiseOrType<number>; // returns the number of bytes written

export class WriteSerializedColumn<T extends OneResult>
  implements ColumnLikeValue
{
  private encoder: WriteSerializedColumnEncoder<T>;
  private source: ColumnLikeValue;

  constructor(
    encoder: WriteSerializedColumnEncoder<T>,
    source: ColumnLikeValue
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
  async getData(): Promise<OneResult> {
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

    let offset = initialOffset;
    for await (const value of data(start, end)) {
      offset = await this.encoder(buffer, offset, value as T);
    }

    return offset;
  }
}
