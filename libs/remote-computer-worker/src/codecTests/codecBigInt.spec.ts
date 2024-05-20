// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodeBigInt } from '../worker/encodeBigInt';
import { decodeBigInt } from '../client/decodeBigInt';

describe('encodes and decodes bigints', () => {
  let buffer: ArrayBuffer;
  let view: Value.GrowableDataView<ArrayBuffer>;

  beforeEach(() => {
    buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    view = new Value.GrowableDataView(buffer);
  });

  it('encodes and decodes 0', () => {
    const bigInt = 0n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a small bigint', () => {
    const bigInt = 11n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a big bigint', () => {
    const bigInt = 1234567890123456789012345678901234567890n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes a bigint with a negative sign', () => {
    const bigInt = -1234567890123456789012345678901234567890n;
    encodeBigInt(view, 0, bigInt);
    const [decoded] = decodeBigInt(view, 0);
    expect(decoded).toEqual(bigInt);
  });

  it('encodes and decodes many bigints', () => {
    const bigInts = [
      0n,
      11n,
      1234567890123456789012345678901234567890n,
      -1234567890123456789012345678901234567890n,
    ];

    let offset = 0;
    for (const bigInt of bigInts) {
      offset = encodeBigInt(view, offset, bigInt);
    }

    offset = 0;
    for (const bigInt of bigInts) {
      const [decoded, newOffset] = decodeBigInt(view, offset);
      expect(decoded).toEqual(bigInt);
      offset = newOffset;
    }
  });
});
