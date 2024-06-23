// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encodes and decodes functions', () => {
  const encodeFunction = valueEncoder({
    kind: 'function',
    name: 'functionName',
  });
  const decodeFunction = valueDecoder({
    kind: 'function',
    name: 'functionName',
  });

  it('encodes and decodes a function', async () => {
    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const fn = Value.FunctionValue.from(['arg1', 'arg2'], {
      type: 'block',
      id: 'block-id',
      args: [
        {
          type: 'function-call',
          args: [
            { type: 'funcref', args: ['+'] },
            {
              type: 'argument-list',
              args: [
                { type: 'ref', args: ['arg1'] },
                { type: 'ref', args: ['arg2'] },
              ],
            },
          ],
        },
      ],
    });
    await encodeFunction(view, 0, fn);
    const [decoded] = await decodeFunction(view, 0);
    expect(decoded).toMatchObject(fn);
  });
});
