import { describe, it, expect } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodingToBuffer } from './encode';
import { decodeFromBuffer } from './decode';

describe('cache value encode and decode', () => {
  it('can decode an empty cache value', async () => {
    const encode = encodingToBuffer({ rootValueKeys: [] });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const length = await encode({}, buffer, dataView);
    const finalBuffer = dataView.seal(length);
    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({});
  });

  it("does not encode if it doesn't have the key", async () => {
    const encode = encodingToBuffer({ rootValueKeys: [] });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const length = await encode({ key1: 'ABC', key2: 42 }, buffer, dataView);
    const finalBuffer = dataView.seal(length);
    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({});
  });

  it('encodes if it has the key', async () => {
    const encode = encodingToBuffer({ rootValueKeys: ['key1'] });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const length = await encode({ key1: 'ABC', key2: 42 }, buffer, dataView);
    const finalBuffer = dataView.seal(length);
    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({ key1: 'ABC' });
  });

  it('encodes deeply if it has the key', async () => {
    const encode = encodingToBuffer({ rootValueKeys: ['key1.key2.key3'] });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const length = await encode(
      {
        key1: {
          key2: {
            key3: 'ABC',
            willNotUseThisKey: 42,
          },
          willNotUseThisKey: 42,
        },
        willNotUseThisKey: 42,
      },
      buffer,
      dataView
    );
    const finalBuffer = dataView.seal(length);
    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({
      key1: {
        key2: {
          key3: 'ABC',
        },
      },
    });
  });

  it('encodes deeply if it has the beginning of the key', async () => {
    const encode = encodingToBuffer({ rootValueKeys: ['key1'] });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const length = await encode(
      {
        key1: {
          key2: {
            key3: 'ABC',
          },
        },
        willNotUseThisKey: 42,
      },
      buffer,
      dataView
    );
    const finalBuffer = dataView.seal(length);
    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({
      key1: {
        key2: {
          key3: 'ABC',
        },
      },
    });
  });

  it('encodes array buffers as well as JSON or array values', async () => {
    const encode = encodingToBuffer({
      rootValueKeys: ['key1.key2.key3', 'key1.key2.key4', 'key1.key2.key6'],
    });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const innerBuffer = new ArrayBuffer(3);
    const view = new Uint8Array(innerBuffer);
    view[0] = 65;
    view[1] = 66;
    view[2] = 67;

    const length = await encode(
      {
        key1: {
          key2: {
            key3: innerBuffer,
            willNotUseThisKey: 42,
            key4: {
              key5: 'ABC',
            },
            key6: [innerBuffer, innerBuffer, { c: 3 }],
          },
          willNotUseThisKey: 42,
        },
        willNotUseThisKey: 42,
      },
      buffer,
      dataView
    );
    const finalBuffer = dataView.seal(length);

    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({
      key1: {
        key2: {
          key3: innerBuffer,
          key4: {
            key5: 'ABC',
          },
          key6: [innerBuffer, innerBuffer, { c: 3 }],
        },
      },
    });
  });

  it('encodes array buffers after root', async () => {
    const encode = encodingToBuffer({
      rootValueKeys: ['key1'],
    });
    const decode = decodeFromBuffer;

    const buffer = createResizableArrayBuffer();
    const dataView = new Value.GrowableDataView(buffer);

    const innerBuffer = new ArrayBuffer(3);
    const view = new Uint8Array(innerBuffer);
    view[0] = 65;
    view[1] = 66;
    view[2] = 67;

    const length = await encode(
      {
        key1: [innerBuffer, innerBuffer, innerBuffer],
      },
      buffer,
      dataView
    );
    const finalBuffer = dataView.seal(length);

    const result = await decode(new DataView(finalBuffer));
    expect(result).toEqual({
      key1: [innerBuffer, innerBuffer, innerBuffer],
    });
  });
});
