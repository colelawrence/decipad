import { expect, describe, it } from 'vitest';
import { nanoid } from 'nanoid';
import { type Result, type AST, Unknown } from '@decipad/language-interfaces';
import type { IdentifiedBlock, Program } from '@decipad/computer-interfaces';
import { Value } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import { buildResult, decilang, getComputer } from '@decipad/computer';
import { layoutPowerData } from './layoutPowerData';

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
    ).toMatchInlineSnapshot(`[]`);
  });

  it('works with one column one group tree', async () => {
    const computer = getComputer();
    const results = await computer.computeDeltaRequest({
      program: {
        upsert: toProgram([
          decilang`DataTable = {
          Column1 = ["A"]
        }`,
          decilang`Tree = tree(DataTable)`,
        ]),
      },
    });
    const tree = getDefined(
      results?.blockResults['block-1']?.result,
      'no result for block-1'
    ) as Result.Result<'tree'>;
    expect(tree).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "columnNames": [
            "Column1",
          ],
          "columnTypes": [
            {
              "kind": "string",
            },
          ],
          "kind": "tree",
        },
        "value": Tree {
          "children": [
            Tree {
              "children": [],
              "columns": [],
              "originalCardinality": 1,
              "root": "A",
              "rootAggregation": undefined,
            },
          ],
          "columns": [
            {
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
      [
        {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == "A")).Column1))",
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/a32fd8b31587b9c6354faa86e12756d2e7aca860346be182aacebb91f0b58026",
          "replicaCount": 1,
          "type": {
            "kind": "string",
          },
          "value": "A",
        },
        {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": [],
          "elementType": "smartrow",
          "global": true,
          "type": undefined,
          "value": Symbol(unknown),
        },
      ]
    `);
  });

  it('works with one column one group tree and aggregation', async () => {
    const computer = getComputer();
    const results = await computer.computeDeltaRequest({
      program: {
        upsert: toProgram([
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
      },
    });
    const tree = getDefined(
      results?.blockResults['block-4']?.result,
      'no result for block-4'
    ) as Result.Result<'tree'>;
    expect(tree).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "columnNames": [
            "Column1",
          ],
          "columnTypes": [
            {
              "kind": "string",
            },
          ],
          "kind": "tree",
        },
        "value": Tree {
          "children": [
            Tree {
              "children": [],
              "columns": [],
              "originalCardinality": 1,
              "root": "A",
              "rootAggregation": undefined,
            },
          ],
          "columns": [
            {
              "aggregation": {
                "meta": undefined,
                "type": {
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
      [
        {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == "A")).Column1))",
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/a32fd8b31587b9c6354faa86e12756d2e7aca860346be182aacebb91f0b58026",
          "replicaCount": 1,
          "type": {
            "kind": "string",
          },
          "value": "A",
        },
        {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": [],
          "elementType": "smartrow",
          "global": true,
          "type": {
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
    const computer = getComputer();
    const results = await computer.computeDeltaRequest({
      program: {
        upsert: toProgram([
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
      },
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
      [
        {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == "A")).Column1))",
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": "sum((filter(TableName, TableName.Column1 == "A")).Column2)",
              "children": [],
              "elementType": "smartrow",
              "global": false,
              "type": {
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
          "id": "/ab2343f77c33a58d1431ce0434a21d3d385f00b3308206522aaef176e539a7cc",
          "replicaCount": 2,
          "type": {
            "kind": "string",
          },
          "value": "A",
        },
        {
          "aggregationExpression": "count(unique((filter(TableName, TableName.Column1 == "B")).Column1))",
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": "sum((filter(filter(TableName, TableName.Column1 == "B"), (filter(TableName, TableName.Column1 == "B")).Column2 == 2)).Column2)",
              "aggregationResult": undefined,
              "children": [],
              "collapsible": false,
              "elementType": "group",
              "id": "/e6058265454b52c33d07e0394ea71bcebe74c4c386cf92d36494fa1c23fbfed9/b0bc58bdde052273dc781192e21d2539e3dc453f1364463569428c0590b16f32",
              "replicaCount": 1,
              "type": {
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
          "id": "/e6058265454b52c33d07e0394ea71bcebe74c4c386cf92d36494fa1c23fbfed9",
          "replicaCount": 1,
          "type": {
            "kind": "string",
          },
          "value": "B",
        },
        {
          "aggregationExpression": "count(unique(TableName.Column1))",
          "children": [
            {
              "aggregationExpression": "sum(TableName.Column2)",
              "children": [],
              "elementType": "smartrow",
              "global": true,
              "type": {
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
          "type": {
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
