import { type SerializedType } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';
import { all, from, slice } from '@decipad/generator-utils';
import { ResultGenerator } from 'libs/language-interfaces/src/Result';

describe('encode and decode column', () => {
  it('can encode and decode a column with values', async () => {
    const columnType: SerializedType = {
      kind: 'column',
      cellType: { kind: 'number', unit: null },
      indexedBy: null,
    };
    const columnEncoder = valueEncoder(columnType);
    const columnDecoder = valueDecoder(columnType);
    const column = (start = 0, end = Infinity) =>
      slice(from([N(1), N(2), N(3)]), start, end);
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    const length = await columnEncoder(buffer, 0, column);
    const result = buffer.seal(length);
    const [decodedColumn] = await columnDecoder(new DataView(result), 0);
    expect(typeof decodedColumn).toBe('function');
    expect(await all((decodedColumn as ResultGenerator)())).toMatchObject(
      await all(column())
    );
  });

  it('can encode and decode a column with columns', async () => {
    const columnType: SerializedType = {
      kind: 'column',
      cellType: {
        kind: 'column',
        cellType: { kind: 'number', unit: null },
        indexedBy: null,
      },
      indexedBy: null,
    };
    const columnEncoder = valueEncoder(columnType);
    const columnDecoder = valueDecoder(columnType);
    const col1 = (start = 0, end = Infinity) =>
      slice(from([N(1), N(2), N(3)]), start, end);
    const col2 = (start = 0, end = Infinity) =>
      slice(from([N(4), N(5), N(6)]), start, end);
    const column = (start = 0, end = Infinity) =>
      slice(from([col1, col2]), start, end);
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    const length = await columnEncoder(buffer, 0, column);
    const result = buffer.seal(length);
    const [decodedColumn] = await columnDecoder(new DataView(result), 0);
    expect(typeof decodedColumn).toBe('function');
    const allColumns = await all((decodedColumn as ResultGenerator)());
    const allColumnValues = await Promise.all(
      allColumns.map((col) => all(getResultGenerator(col)()))
    );
    expect(allColumnValues).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 4n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 6n,
            "s": 1n,
          },
        ],
      ]
    `);
  });
});
