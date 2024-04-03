import { N } from '@decipad/number';
import { Unknown, Value } from '@decipad/remote-computer';
import { layoutPowerData } from './useDataViewLayoutData';

describe('layoutPowerData', () => {
  it('lays out an empty table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [],
            columnNames: [],
          },
          value: Value.Tree.empty(Unknown),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toEqual([]);
  });

  it('lays out empty a one-column one-cell table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [],
            columnNames: [],
          },
          value: Value.Tree.from(
            Unknown,
            undefined,
            [Value.Tree.from(N(1), undefined, [], [], 0)],
            [
              {
                name: 'columnName',
                aggregation: undefined,
              },
            ],

            1
          ),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 0,
          "type": undefined,
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

  it('lays out an un-groupable one-column multi-cell table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [{ kind: 'number', unit: null }],
            columnNames: ['columnName'],
          },
          value: Value.Tree.from(
            Unknown,
            undefined,
            [1, 2, 3].map((n) => Value.Tree.from(N(n), undefined, [], [], 1)),
            [
              {
                name: 'columnName',
                aggregation: undefined,
              },
            ],

            1
          ),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
          "type": Object {
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
      ]
    `);
  });

  it('lays out a groupable one-column multi-cell table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [{ kind: 'number', unit: null }],
            columnNames: ['columnName'],
          },
          value: Value.Tree.from(
            Unknown,
            undefined,
            [
              Value.Tree.from(N(1), undefined, [], [], 2),
              Value.Tree.from(N(2), undefined, [], [], 1),
            ],

            [
              {
                name: 'columnName',
                aggregation: undefined,
              },
            ],

            1
          ),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 2,
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
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
      ]
    `);
  });

  it('lays out a un-groupable two-column multi-cell table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [
              { kind: 'number', unit: null },
              { kind: 'number', unit: null },
            ],

            columnNames: ['Column1', 'Column2'],
          },
          value: Value.Tree.from(
            Unknown,
            undefined,
            [
              Value.Tree.from(
                N(1),
                undefined,
                [Value.Tree.from(N(4), undefined, [], [], 1)],
                [],
                1
              ),
              Value.Tree.from(
                N(2),
                undefined,
                [Value.Tree.from(N(4), undefined, [], [], 1)],
                [],
                1
              ),
              Value.Tree.from(
                N(3),
                undefined,
                [Value.Tree.from(N(5), undefined, [], [], 1)],
                [],
                1
              ),
            ],

            [
              {
                name: 'columnName',
                aggregation: undefined,
              },
            ],

            1
          ),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": undefined,
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
                "n": 4n,
                "s": 1n,
              },
            },
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": undefined,
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
                "n": 4n,
                "s": 1n,
              },
            },
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": undefined,
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
                "n": 5n,
                "s": 1n,
              },
            },
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
          "replicaCount": 1,
          "type": Object {
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
      ]
    `);
  });

  it('lays out a groupable two-column multi-cell table', async () => {
    expect(
      await layoutPowerData({
        tableName: 'tableName',
        tree: {
          type: {
            kind: 'tree',
            columnTypes: [
              { kind: 'number', unit: null },
              { kind: 'number', unit: null },
            ],

            columnNames: ['Column1', 'Column2'],
          },
          value: Value.Tree.from(
            Unknown,
            undefined,
            [
              Value.Tree.from(
                N(1),
                undefined,
                [
                  Value.Tree.from(N(4), undefined, [], [], 1),
                  Value.Tree.from(N(6), undefined, [], [], 1),
                ],

                [],
                2
              ),
              Value.Tree.from(
                N(2),
                undefined,
                [Value.Tree.from(N(5), undefined, [], [], 1)],
                [],
                1
              ),
            ],

            [
              {
                name: 'columnName',
                aggregation: undefined,
              },
            ],

            1
          ),
        },
        aggregationTypes: [],
        roundings: [],
        filters: [],
        expandedGroups: [],
        preventExpansion: false,
      })
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [],
          "collapsible": true,
          "elementType": "group",
          "id": "/",
          "replicaCount": 2,
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
        Object {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": Array [
            Object {
              "aggregationExpression": undefined,
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
                "n": 5n,
                "s": 1n,
              },
            },
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/",
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
      ]
    `);
  });
});
