// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { valueDecoder } from '../client/valueDecoder';
import { valueEncoder } from '../worker/valueEncoder';

describe('encodes and decodes booleans', () => {
  const encodeBoolean = valueEncoder({ kind: 'boolean' });
  const decodeBoolean = valueDecoder({ kind: 'boolean' });

  it('encodes and decodes true', async () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const bool = true;
    await encodeBoolean(view, 0, bool);
    const [decoded] = await decodeBoolean(view, 0);
    expect(decoded).toStrictEqual(bool);
  });

  it('encodes and decodes false', async () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const bool = false;
    await encodeBoolean(view, 0, bool);
    const [decoded] = await decodeBoolean(view, 0);
    expect(decoded).toStrictEqual(bool);
  });
});
