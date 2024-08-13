import type { SerializedTypes } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encodes and decodes row', () => {
  it('encodes and decodes a row', async () => {
    const type: SerializedTypes.Row = {
      kind: 'row',
      rowCellNames: ['dateColumn', 'numberColumn'],
      rowCellTypes: [{ kind: 'date', date: 'day' }, { kind: 'number' }],
      rowIndexName: 'dateColumn',
    };
    const encodeRow = valueEncoder(type);
    const decodeRow = valueDecoder(type);

    const buffer = createResizableArrayBuffer(2);
    const view = new Value.GrowableDataView(buffer);
    const row = [BigInt(Date.now()), N(33, 2)];
    await encodeRow(view, 0, row, undefined);
    const [decoded] = await decodeRow(view, 0);
    expect(decoded).toMatchObject(row);
  });
});
