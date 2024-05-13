import { all } from '@decipad/generator-utils';
import { buildType } from '../Type';
import { GeneratorTable } from './GeneratorTable';
import { N } from '@decipad/number';
import { materializeOneResult } from '../utils';
import type { TableValue } from './TableValue';
import { isColumnLike } from './ColumnLike';

describe('GeneratorTable', () => {
  it('can be empty', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {}
    );
    expect(await table.getData()).toHaveLength(0);
  });

  it('can have multiple columns with no data', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {},
      ['A', 'B'],
      [buildType.number(), buildType.string()]
    );
    const colGens = await table.getData();
    expect(colGens).toHaveLength(2);
    for (const colGen of colGens) {
      // eslint-disable-next-line no-await-in-loop
      const materializedCol = await all(colGen());
      expect(materializedCol).toHaveLength(0);
    }
  });

  it('can have multiple columns with data', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {
        yield [N(1), 'a'];
        yield [N(2), 'b'];
      },
      ['A', 'B'],
      [buildType.number(), buildType.string()]
    );
    const colGens = await table.getData();
    expect(colGens).toHaveLength(2);
    expect(await all(colGens[0]())).toEqual([N(1), N(2)]);
    expect(await all(colGens[1]())).toEqual(['a', 'b']);
  });

  it('can materialize columns', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {
        yield [N(1), 'a'];
        yield [N(2), 'b'];
      },
      ['A', 'B'],
      [buildType.number(), buildType.string()]
    );
    const colGens = await table.getData();
    expect(await materializeOneResult(colGens)).toMatchInlineSnapshot(`
      Array [
        Array [
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
        ],
        Array [
          "a",
          "b",
        ],
      ]
    `);
  });

  it('can retrieve one column', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {
        yield [N(1), 'a'];
        yield [N(2), 'b'];
      },
      ['A', 'B'],
      [buildType.number(), buildType.string()]
    ) as TableValue;
    const column = table.getColumn('A');
    expect(isColumnLike(column)).toBe(true);
    expect(await materializeOneResult(column.getData())).toMatchInlineSnapshot(`
      Array [
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
      ]
    `);
  });

  it('can retrieve columns', async () => {
    const table = GeneratorTable.fromNamedColumns(
      // eslint-disable-next-line no-empty-function
      async function* gen() {
        yield [N(1), 'a'];
        yield [N(2), 'b'];
      },
      ['A', 'B'],
      [buildType.number(), buildType.string()]
    ) as TableValue;
    const { columns } = table;
    expect(columns).toHaveLength(2);
    for (const col of columns) {
      expect(isColumnLike(col)).toBe(true);
    }
    expect(
      await Promise.all(
        columns.map(async (col) => materializeOneResult(await col.getData()))
      )
    ).toMatchInlineSnapshot(`
      Array [
        Array [
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
        ],
        Array [
          "a",
          "b",
        ],
      ]
    `);
  });
});
