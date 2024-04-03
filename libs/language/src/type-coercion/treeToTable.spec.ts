import { N } from '@decipad/number';
import { Unknown, Value, buildType } from '..';
import { makeContext } from '../infer';
import { Realm } from '../interpreter';
import { treeToTable } from './treeToTable';

describe('treeToTable value', () => {
  it('works on empty tree value', async () => {
    const tableValue = await treeToTable.value(
      new Realm(makeContext()),
      buildType.tree({
        columnNames: [],
        columnTypes: [],
      }),
      Value.Tree.from(Unknown, undefined, [], [])
    );
    expect(tableValue).toMatchInlineSnapshot(`
      Table {
        "columnNames": Array [],
        "columns": Array [],
      }
    `);
  });

  it('works on a one column one value tree value', async () => {
    const tableValue = await treeToTable.value(
      new Realm(makeContext()),
      buildType.tree({
        columnNames: ['Col1'],
        columnTypes: [buildType.number()],
      }),
      Value.Tree.from(
        Unknown,
        undefined,
        [Value.Tree.from(N(1), undefined, [], [])],
        [
          {
            name: 'Col1',
            aggregation: { type: { kind: 'number' }, value: N(1) },
          },
        ]
      )
    );
    expect(tableValue).toMatchInlineSnapshot(`
      Table {
        "columnNames": Array [
          "Col1",
        ],
        "columns": Array [
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
        ],
      }
    `);
  });

  it('works on a one column 3 value tree value', async () => {
    const tableValue = await treeToTable.value(
      new Realm(makeContext()),
      buildType.tree({
        columnNames: ['Col1'],
        columnTypes: [buildType.number()],
      }),
      Value.Tree.from(
        Unknown,
        undefined,
        [
          Value.Tree.from(
            N(1),
            undefined,
            [],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
          Value.Tree.from(
            N(2),
            undefined,
            [],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
          Value.Tree.from(
            N(3),
            undefined,
            [],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
        ],
        []
      )
    );
    expect(tableValue).toMatchInlineSnapshot(`
      Table {
        "columnNames": Array [
          "Col1",
        ],
        "columns": Array [
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 2n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 3n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
        ],
      }
    `);
  });

  it('works on a two column 1 row tree value', async () => {
    const tableValue = await treeToTable.value(
      new Realm(makeContext()),
      buildType.tree({
        columnNames: ['Col1', 'Col2'],
        columnTypes: [buildType.number(), buildType.string()],
      }),
      Value.Tree.from(
        Unknown,
        undefined,
        [
          Value.Tree.from(
            N(1),
            undefined,
            [
              Value.Tree.from(
                'A',
                undefined,
                [],
                [
                  {
                    name: 'Col2',
                    aggregation: { type: { kind: 'number' }, value: N(1) },
                  },
                ]
              ),
            ],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
              {
                name: 'Col2',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
        ],
        []
      )
    );
    expect(tableValue).toMatchInlineSnapshot(`
      Table {
        "columnNames": Array [
          "Col1",
          "Col2",
        ],
        "columns": Array [
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
        ],
      }
    `);
  });

  it('works on a two column 3 rows tree value', async () => {
    const tableValue = await treeToTable.value(
      new Realm(makeContext()),
      buildType.tree({
        columnNames: ['Col1', 'Col2'],
        columnTypes: [buildType.number(), buildType.string()],
      }),
      Value.Tree.from(
        Unknown,
        undefined,
        [
          Value.Tree.from(
            N(1),
            undefined,
            [
              Value.Tree.from(
                'A',
                undefined,
                [],
                [
                  {
                    name: 'Col2',
                    aggregation: { type: { kind: 'number' }, value: N(1) },
                  },
                ]
              ),
            ],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
              {
                name: 'Col2',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
          Value.Tree.from(
            N(2),
            undefined,
            [
              Value.Tree.from(
                'B',
                undefined,
                [],
                [
                  {
                    name: 'Col2',
                    aggregation: { type: { kind: 'number' }, value: N(1) },
                  },
                ]
              ),
            ],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
              {
                name: 'Col2',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
          Value.Tree.from(
            N(3),
            undefined,
            [
              Value.Tree.from(
                'C',
                undefined,
                [],
                [
                  {
                    name: 'Col2',
                    aggregation: { type: { kind: 'number' }, value: N(1) },
                  },
                ]
              ),
            ],
            [
              {
                name: 'Col1',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
              {
                name: 'Col2',
                aggregation: { type: { kind: 'number' }, value: N(1) },
              },
            ]
          ),
        ],
        []
      )
    );
    expect(tableValue).toMatchInlineSnapshot(`
      Table {
        "columnNames": Array [
          "Col1",
          "Col2",
        ],
        "columns": Array [
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 2n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 3n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
          Column {
            "_values": Array [
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
              NumberValue {
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
            ],
            "defaultValue": undefined,
          },
        ],
      }
    `);
  });
});
