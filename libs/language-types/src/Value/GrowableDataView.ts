import type { DeepNonNullable } from 'utility-types';

export interface WriteSerializedColumnOptions {
  pageSize?: number;
}

export type AllWriteSerializedColumnOptions =
  DeepNonNullable<WriteSerializedColumnOptions>;

const defaults: AllWriteSerializedColumnOptions = {
  pageSize: 1024 * 10,
};

const supportsSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

export class GrowableDataView<TBuffer extends SharedArrayBuffer | ArrayBuffer>
  implements DataView
{
  private buf: TBuffer;
  private inner: DataView;
  private options: AllWriteSerializedColumnOptions;

  public byteOffset = 0;

  constructor(
    buffer: TBuffer,
    options: WriteSerializedColumnOptions = defaults
  ) {
    this.buf = buffer;
    this.inner = new DataView(buffer);
    this.options = { ...defaults, ...options };
  }

  get buffer(): ArrayBuffer {
    return this.inner.buffer;
  }

  private ensureCapacity(size: number) {
    while (size > this.buf.byteLength) {
      if (this.buf instanceof ArrayBuffer) {
        if (!this.buf.resizable) {
          throw new Error(
            "You have an outdated browser, please update. If you're using Firefox, please use another browser"
          );
        }
        this.buf.resize(this.buf.byteLength + this.options.pageSize);
      } else if (
        supportsSharedArrayBuffer &&
        this.buf instanceof SharedArrayBuffer
      ) {
        if (!this.buf.growable) {
          throw new Error(
            "You have an outdated browser, please update. If you're using Firefox, please use another browser"
          );
        }
        this.buf.grow(this.buf.byteLength + this.options.pageSize);
      }
    }
  }

  public seal(size: number): TBuffer {
    return this.buf.slice(0, size) as TBuffer;
  }

  get [Symbol.toStringTag](): string {
    return this.inner[Symbol.toStringTag];
  }
  get byteLength(): number {
    return this.inner.byteLength;
  }

  getFloat32(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getFloat32(byteOffset, littleEndian);
  }
  getFloat64(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getFloat64(byteOffset, littleEndian);
  }
  getInt8(byteOffset: number): number {
    return this.inner.getInt8(byteOffset);
  }
  getInt16(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getInt16(byteOffset, littleEndian);
  }
  getInt32(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getInt32(byteOffset, littleEndian);
  }
  getUint8(byteOffset: number): number {
    return this.inner.getUint8(byteOffset);
  }
  getUint16(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getUint16(byteOffset, littleEndian);
  }
  getUint32(byteOffset: number, littleEndian?: boolean): number {
    return this.inner.getUint32(byteOffset, littleEndian);
  }
  getBigInt64(byteOffset: number, littleEndian?: boolean | undefined): bigint {
    return this.inner.getBigInt64(byteOffset, littleEndian);
  }
  getBigUint64(byteOffset: number, littleEndian?: boolean | undefined): bigint {
    return this.inner.getBigUint64(byteOffset, littleEndian);
  }

  setFloat32(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 4);
    this.inner.setFloat32(byteOffset, value, littleEndian);
  }
  setFloat64(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 8);
    this.inner.setFloat64(byteOffset, value, littleEndian);
  }
  setInt8(byteOffset: number, value: number): void {
    this.ensureCapacity(byteOffset + 1);
    this.inner.setInt8(byteOffset, value);
  }
  setInt16(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 2);
    this.inner.setInt16(byteOffset, value, littleEndian);
  }
  setInt32(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 4);
    this.inner.setInt32(byteOffset, value, littleEndian);
  }
  setUint8(byteOffset: number, value: number): void {
    this.ensureCapacity(byteOffset + 1);
    this.inner.setUint8(byteOffset, value);
  }
  setUint16(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 2);
    this.inner.setUint16(byteOffset, value, littleEndian);
  }
  setUint32(
    byteOffset: number,
    value: number,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 4);
    this.inner.setUint32(byteOffset, value, littleEndian);
  }
  setBigInt64(
    byteOffset: number,
    value: bigint,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 8);
    this.inner.setBigInt64(byteOffset, value, littleEndian);
  }
  setBigUint64(
    byteOffset: number,
    value: bigint,
    littleEndian?: boolean | undefined
  ): void {
    this.ensureCapacity(byteOffset + 8);
    this.inner.setBigUint64(byteOffset, value, littleEndian);
  }
}
