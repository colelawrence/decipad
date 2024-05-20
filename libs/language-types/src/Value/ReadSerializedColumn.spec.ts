import { all } from '@decipad/generator-utils';
import type { ReadSerializedColumnDecoder } from './ReadSerializedColumn';
import { ReadSerializedColumn } from './ReadSerializedColumn';
import { getResultGenerator } from '../utils/getResultGenerator';
import { N } from '@decipad/number';

describe('SerializedColumn', () => {
  const decoder: ReadSerializedColumnDecoder<bigint> = (buffer, offset) => [
    buffer.getBigInt64(offset),
    offset + 8,
  ];

  it('decodes on generator from .getData()', async () => {
    const count = 100;
    const underlyingBuffer = new ArrayBuffer(8 * count);
    const buffer = new DataView(underlyingBuffer);
    for (let i = 0; i < count; i++) {
      buffer.setBigInt64(i * 8, BigInt(i));
    }
    const column = new ReadSerializedColumn(
      { kind: 'number' },
      decoder,
      buffer,
      []
    );

    const values = await all(getResultGenerator(await column.getData())());
    for (let i = 0; i < count; i++) {
      expect(values[i]).toBe(BigInt(i));
    }

    const valuesValues = await all(column.values());
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      expect(await valuesValues[i].getData()).toEqual(N(i));
    }
  });

  it('decodes on partial generator from .getData()', async () => {
    const count = 100;
    const underlyingBuffer = new ArrayBuffer(8 * count);
    const buffer = new DataView(underlyingBuffer);
    for (let i = 0; i < count; i++) {
      buffer.setBigInt64(i * 8, BigInt(i));
    }
    const column = new ReadSerializedColumn(
      { kind: 'number' },
      decoder,
      buffer,
      []
    );

    const values = await all(
      getResultGenerator(await column.getData())(50, 61)
    );
    expect(values).toEqual(
      Array.from({ length: 11 }, (_, i) => BigInt(i + 50))
    );

    const valuesValues = await all(column.values(50, 61));
    expect(
      await Promise.all(valuesValues.map(async (v) => v.getData()))
    ).toEqual(Array.from({ length: 11 }, (_, i) => N(i + 50)));
  });
});
