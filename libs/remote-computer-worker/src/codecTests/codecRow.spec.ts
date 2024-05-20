// eslint-disable-next-line no-restricted-imports
import type { SerializedTypes } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { valueEncoder } from '../worker/valueEncoder';
import { valueDecoder } from '../client/valueDecoder';
import { N } from '@decipad/number';

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

    const buffer = new ArrayBuffer(2, { maxByteLength: 10000000 });
    const view = new Value.GrowableDataView(buffer);
    const row = [BigInt(Date.now()), N(33, 2)];
    await encodeRow(view, 0, row);
    const [decoded] = await decodeRow(view, 0);
    expect(decoded).toMatchObject(row);
  });
});
