// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encodes and decodes ranges', () => {
  it('encodes and decodes a date range', async () => {
    const encodeDateRange = valueEncoder({
      kind: 'range',
      rangeOf: { kind: 'date', date: 'day' },
    });
    const decodeDateRange = valueDecoder({
      kind: 'range',
      rangeOf: { kind: 'date', date: 'day' },
    });

    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const now = BigInt(Date.now());
    const dateRange = [now, now + 1000n];
    await encodeDateRange(view, 0, dateRange, undefined);
    const [decoded] = await decodeDateRange(view, 0);
    expect(decoded).toMatchObject(dateRange);
  });

  it('encodes and decodes a number range', async () => {
    const encodeNumberRange = valueEncoder({
      kind: 'range',
      rangeOf: { kind: 'number' },
    });
    const decodeNumberRange = valueDecoder({
      kind: 'range',
      rangeOf: { kind: 'number' },
    });
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const range = [N(32, 44), N(21, 3)];
    await encodeNumberRange(view, 0, range, undefined);
    const [decoded] = await decodeNumberRange(view, 0);
    expect(decoded).toMatchObject(range);
  });
});
