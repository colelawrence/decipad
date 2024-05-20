// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import DeciNumber, { N } from '@decipad/number';
import { encodeNumber } from '../worker/encodeNumber';
import { decodeNumber } from '../client/decodeNumber';

describe('encodes and decodes DeciNumber', () => {
  let buffer: ArrayBuffer;
  let view: Value.GrowableDataView<ArrayBuffer>;

  beforeEach(() => {
    buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    view = new Value.GrowableDataView(buffer);
  });

  it('encodes and decodes 0', () => {
    const n = N(0);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes infinity', () => {
    const n = DeciNumber.infinite(1);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes - infinity', () => {
    const n = DeciNumber.infinite(-1);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes undefined', () => {
    const n = DeciNumber.undefined();
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes a small integer number', () => {
    const n = N(11);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toMatchObject(n);
  });

  it('encodes and decodes a big integer', () => {
    const n = N(1234567890123456789012345678901234567890n);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toEqual(n);
  });

  it('encodes and decodes a negative big integer', () => {
    const n = N(-1234567890123456789012345678901234567890n);
    encodeNumber(view, 0, n);
    const [decoded] = decodeNumber(view, 0);
    expect(decoded).toEqual(n);
  });

  it('encodes and decodes many numbers', () => {
    const numbers = [
      N(0),
      N(11),
      N(1234567890123456789012345678901234567890n),
      N(-1234567890123456789012345678901234567890n),
      DeciNumber.infinite(1),
      DeciNumber.infinite(-1),
      DeciNumber.undefined(),
    ];
    let offset = 0;
    numbers.forEach((n) => {
      offset = encodeNumber(view, offset, n);
    });

    offset = 0;
    const decoded = numbers.map(() => {
      let n: DeciNumber;
      [n, offset] = decodeNumber(view, offset);
      return n;
    });
    expect(decoded).toMatchObject(numbers);
  });
});
