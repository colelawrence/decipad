import {
  type SerializedType,
  type Result,
  Unknown,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { valueEncoder } from '../encode/valueEncoder';
import { valueDecoder } from '../decode/valueDecoder';

describe('encode and decode tree', () => {
  const meta = () => undefined;
  const undefinedResult: Result.Result = {
    type: { kind: 'nothing' },
    value: Unknown,
    meta,
  };

  it('can decode empty tree', async () => {
    const emptyTreeType: SerializedType = {
      kind: 'tree',
      columnNames: [],
      columnTypes: [],
    };
    const treeEncoder = valueEncoder(emptyTreeType);
    const treeDecoder = valueDecoder(emptyTreeType);
    const tree = Value.Tree.from(
      Unknown,
      { type: { kind: 'nothing' }, value: Unknown, meta },
      [],
      []
    );
    const buffer = new DataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree, undefined);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchInlineSnapshot(`
      Tree {
        "children": [],
        "columns": [],
        "originalCardinality": 1,
        "root": Symbol(unknown),
        "rootAggregation": {
          "meta": [Function],
          "type": {
            "kind": "nothing",
          },
          "value": Symbol(unknown),
        },
      }
    `);
  });

  it('can encode and decode a tree with some columns', async () => {
    const treeType: SerializedType = {
      kind: 'tree',
      columnTypes: [
        { kind: 'number', unit: null },
        { kind: 'string' },
        { kind: 'number', unit: null },
      ],
      columnNames: ['Col1', 'Col2', 'Col3'],
    };
    const treeEncoder = valueEncoder(treeType);
    const treeDecoder = valueDecoder(treeType);
    const tree = Value.Tree.from(
      Unknown,
      undefinedResult,
      [
        Value.Tree.from(
          N(1),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(1),
            meta,
          },
          [
            Value.Tree.from(
              'A',
              undefinedResult,
              [Value.Tree.from(N(10), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(10),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(10),
                meta,
              },
            },
          ]
        ),
      ],
      [
        {
          name: 'Col1',
          aggregation: {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(5),
            meta,
          },
        },
        {
          name: 'Col2',
        },
        {
          name: 'Col3',
          aggregation: {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(150),
            meta,
          },
        },
      ]
    );
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree, undefined);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchInlineSnapshot(`
      Tree {
        "children": [
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 10n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 10n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "A",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 10n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
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
          },
        ],
        "columns": [
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 5n,
                "s": 1n,
              },
            },
            "name": "Col1",
          },
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "nothing",
              },
              "value": Symbol(unknown),
            },
            "name": "Col2",
          },
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 150n,
                "s": 1n,
              },
            },
            "name": "Col3",
          },
        ],
        "originalCardinality": 1,
        "root": Symbol(unknown),
        "rootAggregation": {
          "meta": [Function],
          "type": {
            "kind": "nothing",
          },
          "value": Symbol(unknown),
        },
      }
    `);
  });

  it('can encode and decode a tree with some columns (2)', async () => {
    const treeType: SerializedType = {
      kind: 'tree',
      columnTypes: [
        { kind: 'number', unit: null },
        { kind: 'string' },
        { kind: 'number', unit: null },
      ],
      columnNames: ['Col1', 'Col2', 'Col3'],
    };
    const treeEncoder = valueEncoder(treeType);
    const treeDecoder = valueDecoder(treeType);
    const tree = Value.Tree.from(
      Unknown,
      undefinedResult,
      [
        Value.Tree.from(
          N(1),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(1),
            meta,
          },
          [
            Value.Tree.from(
              'A',
              undefinedResult,
              [Value.Tree.from(N(10), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(10),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(10),
                meta,
              },
            },
          ]
        ),
        Value.Tree.from(
          N(2),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(2),
            meta,
          },
          [
            Value.Tree.from(
              'B',
              undefinedResult,
              [Value.Tree.from(N(20), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(20),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(20),
                meta,
              },
            },
          ]
        ),
        Value.Tree.from(
          N(3),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(3),
            meta,
          },
          [
            Value.Tree.from(
              'A',
              undefinedResult,
              [Value.Tree.from(N(30), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(30),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(30),
                meta,
              },
            },
          ]
        ),
        Value.Tree.from(
          N(4),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(4),
            meta,
          },
          [
            Value.Tree.from(
              'B',
              undefinedResult,
              [Value.Tree.from(N(40), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(40),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(40),
                meta,
              },
            },
          ]
        ),
        Value.Tree.from(
          N(5),
          {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(5),
            meta,
          },
          [
            Value.Tree.from(
              'A',
              undefinedResult,
              [Value.Tree.from(N(50), undefinedResult, [], [])],
              [
                {
                  name: 'Col3',
                  aggregation: {
                    type: {
                      kind: 'number',
                      unit: null,
                    },
                    value: N(50),
                    meta,
                  },
                },
              ]
            ),
          ],
          [
            {
              name: 'Col2',
            },
            {
              name: 'Col3',
              aggregation: {
                type: {
                  kind: 'number',
                  unit: null,
                },
                value: N(50),
                meta,
              },
            },
          ]
        ),
      ],
      [
        {
          name: 'Col1',
          aggregation: {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(5),
            meta,
          },
        },
        {
          name: 'Col2',
        },
        {
          name: 'Col3',
          aggregation: {
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(150),
            meta,
          },
        },
      ]
    );
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree, undefined);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchInlineSnapshot(`
      Tree {
        "children": [
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 10n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 10n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "A",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 10n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
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
          },
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 20n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 20n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "B",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 20n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
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
          },
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 30n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 30n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "A",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 30n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 3n,
                "s": 1n,
              },
            },
          },
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 40n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 40n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "B",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 40n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 4n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
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
          },
          Tree {
            "children": [
              Tree {
                "children": [
                  Tree {
                    "children": [],
                    "columns": [],
                    "originalCardinality": 1,
                    "root": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 50n,
                      "s": 1n,
                    },
                    "rootAggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "nothing",
                      },
                      "value": Symbol(unknown),
                    },
                  },
                ],
                "columns": [
                  {
                    "aggregation": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 50n,
                        "s": 1n,
                      },
                    },
                    "name": "Col3",
                  },
                ],
                "originalCardinality": 1,
                "root": "A",
                "rootAggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
              },
            ],
            "columns": [
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "nothing",
                  },
                  "value": Symbol(unknown),
                },
                "name": "Col2",
              },
              {
                "aggregation": {
                  "meta": [Function],
                  "type": {
                    "kind": "number",
                    "unit": null,
                  },
                  "value": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 50n,
                    "s": 1n,
                  },
                },
                "name": "Col3",
              },
            ],
            "originalCardinality": 1,
            "root": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 5n,
              "s": 1n,
            },
            "rootAggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 5n,
                "s": 1n,
              },
            },
          },
        ],
        "columns": [
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 5n,
                "s": 1n,
              },
            },
            "name": "Col1",
          },
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "nothing",
              },
              "value": Symbol(unknown),
            },
            "name": "Col2",
          },
          {
            "aggregation": {
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 150n,
                "s": 1n,
              },
            },
            "name": "Col3",
          },
        ],
        "originalCardinality": 1,
        "root": Symbol(unknown),
        "rootAggregation": {
          "meta": [Function],
          "type": {
            "kind": "nothing",
          },
          "value": Symbol(unknown),
        },
      }
    `);
  });
});
