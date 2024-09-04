import { expect, describe, it } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { encodeString } from '../encode/encodeString';
import { decodeString } from '../decode/decodeString';

describe('encode and decode string', () => {
  it('encodes and decodes a string', () => {
    const string = 'Hello, world! and some emoji 🎉';
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    encodeString(view, 0, string);
    const [result] = decodeString(view, 0);
    expect(result).toBe(string);
  });

  it('encodes and decodes a lot of strings in the same buffer', () => {
    const strings = [
      'some string',
      'some other string',
      'now some string with emojis 🎉',
      'now some string with foreign characters éèà',
    ];
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    let offset = 0;
    for (const string of strings) {
      offset = encodeString(view, offset, string);
    }
    let currentOffset = 0;
    for (const string of strings) {
      const [result, newOffset] = decodeString(view, currentOffset);
      expect(result).toBe(string);
      currentOffset = newOffset;
    }
  });

  it('encodes and decodes a lot of strings in the same buffer, this time with a SharedArrayBuffer', () => {
    const strings = [
      'some string',
      'some other string',
      'now some string with emojis 🎉',
      'now some string with foreign characters éèà',
    ];
    const buffer = new SharedArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    let offset = 0;
    for (const string of strings) {
      offset = encodeString(view, offset, string);
    }
    let currentOffset = 0;
    for (const string of strings) {
      const [result, newOffset] = decodeString(view, currentOffset);
      expect(result).toBe(string);
      currentOffset = newOffset;
    }
  });
});
