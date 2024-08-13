import { type SerializedType } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value, materializeOneResult } from '@decipad/language-types';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encode and decode table', () => {
  it('can decode empty table', async () => {
    const emptyTableType: SerializedType = {
      kind: 'table',
      columnNames: [],
      columnTypes: [],
      indexName: null,
    };
    const tableEncoder = valueEncoder(emptyTableType);
    const tableDecoder = valueDecoder(emptyTableType);
    const buffer = new DataView(createResizableArrayBuffer(1024));
    await tableEncoder(buffer, 0, [], undefined);
    const [decodedTable] = await tableDecoder(buffer, 0);
    expect(decodedTable).toMatchObject([]);
  });

  it('can encode and decode a table with some columns', async () => {
    const tableType: SerializedType = {
      kind: 'table',
      columnTypes: [
        { kind: 'number', unit: null },
        { kind: 'string' },
        { kind: 'number', unit: null },
      ],
      columnNames: ['Col1', 'Col2', 'Col3'],
      indexName: null,
    };
    const tableEncoder = valueEncoder(tableType);
    const tableDecoder = valueDecoder(tableType);
    const table = [
      [N(1), N(2), N(3)],
      ['A', 'B', 'C'],
      [N(10), N(20), N(30)],
    ];
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    await tableEncoder(buffer, 0, table, undefined);
    const [decodedTable] = await tableDecoder(buffer, 0);
    expect(await materializeOneResult(decodedTable)).toMatchObject(table);
  });
});
