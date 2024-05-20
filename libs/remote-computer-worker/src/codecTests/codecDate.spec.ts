// eslint-disable-next-line no-restricted-imports
import { Unknown, Value } from '@decipad/language-types';
import { valueDecoder } from '../client/valueDecoder';
import { valueEncoder } from '../worker/valueEncoder';
import type { OneResult } from 'libs/language-types/src/Result';

describe('encodes and decodes dates', () => {
  const encodeDate = valueEncoder({ kind: 'date', date: 'day' });
  const decodeDate = valueDecoder({ kind: 'date', date: 'day' });

  it('encodes and decodes a known date', async () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const date = BigInt(Date.now());
    await encodeDate(view, 0, date);
    const [decoded] = await decodeDate(view, 0);
    expect(decoded).toStrictEqual(date);
  });

  it('encodes and decodes undefined date', async () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const date = undefined;
    await encodeDate(view, 0, date);
    const [decoded] = await decodeDate(view, 0);
    expect(decoded).toStrictEqual(Unknown);
  });

  it('encodes and decodes many dates', async () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const dates = [
      BigInt(Date.now()),
      BigInt(Date.now() + 1000),
      undefined,
      BigInt(Date.now() + 2000),
    ];

    // encode
    let offset = 0;
    for (const date of dates) {
      // eslint-disable-next-line no-await-in-loop
      offset = await encodeDate(view, offset, date);
    }

    // decode
    offset = 0;
    for (const date of dates) {
      let decoded: OneResult;
      // eslint-disable-next-line no-await-in-loop
      [decoded, offset] = await decodeDate(view, offset);
      expect(decoded).toStrictEqual(date ?? Unknown);
    }
  });
});
