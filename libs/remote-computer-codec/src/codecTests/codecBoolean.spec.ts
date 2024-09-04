import { expect, describe, it } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encodes and decodes booleans', () => {
  const encodeBoolean = valueEncoder({ kind: 'boolean' });
  const decodeBoolean = valueDecoder({ kind: 'boolean' });

  it('encodes and decodes true', async () => {
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const bool = true;
    await encodeBoolean(view, 0, bool, undefined);
    const [decoded] = await decodeBoolean(view, 0);
    expect(decoded).toStrictEqual(bool);
  });

  it('encodes and decodes false', async () => {
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const bool = false;
    await encodeBoolean(view, 0, bool, undefined);
    const [decoded] = await decodeBoolean(view, 0);
    expect(decoded).toStrictEqual(bool);
  });
});
