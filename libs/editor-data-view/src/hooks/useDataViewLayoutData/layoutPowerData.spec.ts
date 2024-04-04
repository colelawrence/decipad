import type {
  AST,
  IdentifiedBlock,
  Program,
  Result,
} from '@decipad/remote-computer';
import {
  Unknown,
  Value,
  buildResult,
  decilang,
  getRemoteComputer,
} from '@decipad/remote-computer';
import { layoutPowerData } from './layoutPowerData';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';

const programBlock = (
  statement: AST.Statement,
  blockId = nanoid()
): IdentifiedBlock => {
  return {
    type: 'identified-block',
    id: blockId,
    block: {
      id: blockId,
      type: 'block',
      args: [statement],
    },
  };
};

const toProgram = (code: AST.Statement[]): Program => {
  return code.map((c, index) => programBlock(c, `block-${index}`));
};

describe('layoutPowerData', () => {
  it('works with an empty tree', async () => {
    expect(
      await layoutPowerData({
        tableName: 'TableName',
        tree: buildResult(
          {
            kind: 'tree',
            columnTypes: [],
            columnNames: [],
          },
          Value.Tree.from(Unknown, undefined, [], [])
        ),
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('works with one column one group tree', async () => {
    const computer = getRemoteComputer();
    const results = await computer.computeRequest({
      program: toProgram([
        decilang`DataTable = {
          Column1 = ["A"]
        }`,
        decilang`Tree = tree(DataTable)`,
      ]),
    });
    const tree = getDefined(
      results?.blockResults['block-1']?.result,
      'no result for block-1'
    ) as Result.Result<'tree'>;
    expect(tree).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
          ],
          "columnTypes": Array [
            Object {
              "kind": "string",
            },
          ],
          "kind": "tree",
        },
        "value": Tree {
          "children": Array [
            Tree {
              "children": Array [],
              "columns": Array [],
              "originalCardinality": 1,
              "root": "A",
              "rootAggregation": undefined,
            },
          ],
          "columns": Array [
            Object {
              "aggregation": undefined,
              "name": "Column1",
            },
          ],
          "originalCardinality": 1,
          "root": Symbol(unknown),
          "rootAggregation": undefined,
        },
      }
    `);
    expect(
      await layoutPowerData({
        tableName: 'TableName',
        tree,
        aggregationTypes: ['string:count-unique'],
        expandedGroups: [],
        roundings: [],
        filters: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == \\"A\\")).Column1))",
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
          "type": Object {
            "kind": "string",
          },
          "value": "A",
        },
        Object {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": Array [],
          "elementType": "smartrow",
          "global": true,
          "type": undefined,
          "value": Symbol(unknown),
        },
      ]
    `);
  });

  it('works with one column one group tree and aggregation', async () => {
    const computer = getRemoteComputer();
    const results = await computer.computeRequest({
      program: toProgram([
        decilang`DataTable = {
          Column1 = ["A"]
        }`,
        decilang`Empty = {}`,
        decilang`Aggregate(x) = count(unique(x))`,
        decilang`Aggregations = {
          Column1 = Aggregate
        }`,
        decilang`Tree = tree(DataTable, Empty, Empty, Aggregations)`,
      ]),
    });
    const tree = getDefined(
      results?.blockResults['block-4']?.result,
      'no result for block-4'
    ) as Result.Result<'tree'>;
    expect(tree).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
          ],
          "columnTypes": Array [
            Object {
              "kind": "string",
            },
          ],
          "kind": "tree",
        },
        "value": Tree {
          "children": Array [
            Tree {
              "children": Array [],
              "columns": Array [],
              "originalCardinality": 1,
              "root": "A",
              "rootAggregation": undefined,
            },
          ],
          "columns": Array [
            Object {
              "aggregation": Object {
                "type": Object {
                  "kind": "number",
                  "unit": null,
                },
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
              },
              "name": "Column1",
            },
          ],
          "originalCardinality": 1,
          "root": Symbol(unknown),
          "rootAggregation": undefined,
        },
      }
    `);
    expect(
      await layoutPowerData({
        tableName: 'TableName',
        tree,
        aggregationTypes: ['string:count-unique'],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == \\"A\\")).Column1))",
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
          "type": Object {
            "kind": "string",
          },
          "value": "A",
        },
        Object {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": Array [],
          "elementType": "smartrow",
          "global": true,
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        },
      ]
    `);
  });

  it('works with two column two groups tree and aggregation', async () => {
    const computer = getRemoteComputer();
    const results = await computer.computeRequest({
      program: toProgram([
        decilang`DataTable = {
          Column1 = ["A", "B", "A"]
          Column2 = [3, 2, 1]
        }`,
        decilang`Empty = {}`,
        decilang`Aggregate1(x) = count(unique(x))`,
        decilang`Aggregate2(x) = sum(x)`,
        decilang`Aggregations = {
          Column1 = Aggregate1
          Column2 = Aggregate2
        }`,
        decilang`Tree = tree(DataTable, Empty, Empty, Aggregations)`,
      ]),
    });
    const tree = getDefined(
      results?.blockResults['block-5']?.result,
      'no result for block-5'
    ) as Result.Result<'tree'>;
    expect(tree).toMatchSnapshot();
    expect(
      await layoutPowerData({
        tableName: 'TableName',
        tree,
        aggregationTypes: ['string:count-unique', 'number:sum'],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == \\"A\\")).Column1))",
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": "sum((filter(TableName, TableName.Column1 == \\"A\\")).Column2)",
              "children": Array [],
              "elementType": "smartrow",
              "global": false,
              "type": Object {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 4n,
                "s": 1n,
              },
            },
          ],
          "collapsible": true,
          "elementType": "group",
          "id": "/",
          "replicaCount": 2,
          "type": Object {
            "kind": "string",
          },
          "value": "A",
        },
        Object {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == \\"B\\")).Column1))",
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": "sum((filter(filter(TableName, TableName.Column1 == \\"B\\"), (filter(TableName, TableName.Column1 == \\"B\\")).Column2 == 2)).Column2)",
              "aggregationResult": undefined,
              "children": Array [],
              "collapsible": false,
              "elementType": "group",
              "id": "//",
              "replicaCount": 1,
              "type": Object {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 2n,
                "s": 1n,
              },
            },
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
          "type": Object {
            "kind": "string",
          },
          "value": "B",
        },
        Object {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": Array [
            Object {
              "aggregationExpression": "sum(TableName.Column2)",
              "children": Array [],
              "elementType": "smartrow",
              "global": true,
              "type": Object {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 6n,
                "s": 1n,
              },
            },
          ],
          "elementType": "smartrow",
          "global": true,
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        },
      ]
    `);
  });
});
