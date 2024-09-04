import { expect, describe, it } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encodes and decodes dates', () => {
  const encodeDate = valueEncoder({ kind: 'date', date: 'day' });
  const decodeDate = valueDecoder({ kind: 'date', date: 'day' });

  it('encodes and decodes a known date', async () => {
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const date = BigInt(Date.now());
    await encodeDate(view, 0, date, undefined);
    const [decoded] = await decodeDate(view, 0);
    expect(decoded).toStrictEqual(date);
  });

  it('encodes and decodes undefined date', async () => {
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const date = undefined;
    await encodeDate(view, 0, date, undefined);
    const [decoded] = await decodeDate(view, 0);
    expect(decoded).toStrictEqual(Unknown);
  });

  it('encodes and decodes many dates', async () => {
    const buffer = createResizableArrayBuffer(2);
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
      offset = await encodeDate(view, offset, date, undefined);
    }

    // decode
    offset = 0;
    for (const date of dates) {
      let decoded: Result.OneResult;
      // eslint-disable-next-line no-await-in-loop
      [decoded, offset] = await decodeDate(view, offset);
      expect(decoded).toStrictEqual(date ?? Unknown);
    }
  });
});
