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
  const undefinedResult: Result.Result = {
    type: { kind: 'nothing' },
    value: Unknown,
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
      { type: { kind: 'nothing' }, value: Unknown },
      [],
      []
    );
    const buffer = new DataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchObject(tree);
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
          },
        },
      ]
    );
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchObject(tree);
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
          },
        },
      ]
    );
    const buffer = new Value.GrowableDataView(createResizableArrayBuffer(1024));
    await treeEncoder(buffer, 0, tree);
    const [decodedTree] = await treeDecoder(buffer, 0);
    expect(decodedTree).toMatchObject(tree);
  });
});
