import { Table } from './Table';
import { N } from '@decipad/number';
import { materializeOneResult } from '../utils';
import { Column } from './Column';
import { Scalar } from './Scalar';

describe('Table', () => {
  it('can materialize columns', async () => {
    const table = Table.fromNamedColumns(
      [
        Column.fromValues([N(1), N(2)].map(Scalar.fromValue)),
        Column.fromValues(['a', 'b'].map(Scalar.fromValue)),
      ],
      ['Col1', 'Col2']
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

  it('can retrieve columns', async () => {
    const table = Table.fromNamedColumns(
      [
        Column.fromValues([N(1), N(2)].map(Scalar.fromValue)),
        Column.fromValues(['a', 'b'].map(Scalar.fromValue)),
      ],
      ['Col1', 'Col2']
    );
    const { columns } = table;
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
