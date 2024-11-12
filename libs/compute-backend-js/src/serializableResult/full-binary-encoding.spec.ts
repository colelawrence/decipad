import { Result } from '@decipad/language-interfaces';
import { N } from '@decipad/number';
import { describe, it, expect } from 'vitest';
import {
  decodeResultBuffer,
  encodeResultToBuffer,
} from './full-binary-encoding';

describe('Encoding', () => {
  it('Can encode a simple number', async () => {
    const numberResult: Result.Result<'number'> = {
      type: {
        kind: 'number',
      },
      value: N(5),
    };

    const encodedBuffer = await encodeResultToBuffer(numberResult);
    const decodedResult = await decodeResultBuffer(encodedBuffer);

    expect(decodedResult).toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      }
    `);
  });

  it('can encode a larger, more complex number', async () => {
    const numberResult: Result.Result<'number'> = {
      type: {
        kind: 'number',
      },
      value: N(5_000_000_000, 2_000_2000),
    };

    const encodedBuffer = await encodeResultToBuffer(numberResult);
    const decodedResult = await decodeResultBuffer(encodedBuffer);

    expect(decodedResult).toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
        },
        "value": DeciNumber {
          "d": 10001n,
          "infinite": false,
          "n": 2500000n,
          "s": 1n,
        },
      }
    `);
  });

  it('Can encode a string', async () => {
    const numberResult: Result.Result<'string'> = {
      type: {
        kind: 'string',
      },
      value: 'Hello world!',
    };

    const encodedBuffer = await encodeResultToBuffer(numberResult);
    const decodedResult = await decodeResultBuffer(encodedBuffer);

    expect(decodedResult).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "kind": "string",
        },
        "value": "Hello world!",
      }
    `);
  });

  it('Can encode a boolean', async () => {
    const numberResult: Result.Result<'boolean'> = {
      type: {
        kind: 'boolean',
      },
      value: true,
    };

    const encodedBuffer = await encodeResultToBuffer(numberResult);
    const decodedResult = await decodeResultBuffer(encodedBuffer);

    expect(decodedResult).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "kind": "boolean",
        },
        "value": true,
      }
    `);
  });
});
