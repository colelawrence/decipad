import { N } from '@decipad/number';
import { Unknown } from '@decipad/remote-computer';
import { Value } from '@decipad/language-types';
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
      [
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/6928ccba6acd181409639d9943aa09d33152c7e80992998f5d5c1c52b5a0a68d",
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
      [
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/e8ff5fa8101d5c30dd4a077e63a3643da60921a1383a9a7151ecc4f3f03c80fd",
          "replicaCount": 1,
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/b0bc58bdde052273dc781192e21d2539e3dc453f1364463569428c0590b16f32",
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/357645b0b9ff41c07c165c9cc44e1c262db6ddd9344743aa876d9a4bd4f44603",
          "replicaCount": 1,
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
      [
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/4fb48be7eccb023553dbcf97f12f7e01fa459e409bdccafe69097fd2cfc447a7",
          "replicaCount": 2,
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": false,
          "elementType": "group",
          "id": "/b0bc58bdde052273dc781192e21d2539e3dc453f1364463569428c0590b16f32",
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
      [
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": undefined,
              "aggregationResult": undefined,
              "children": [],
              "collapsible": false,
              "elementType": "group",
              "id": "/13a0c0dcf86068e93be28d3bd2cb9f19454c6b764c18b3aa409cbe88fdedfc3f/64af05c38af2169228d32711e4987d231887eb1eba6f7aeada017c73b76e939b",
              "replicaCount": 1,
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
          "collapsible": false,
          "elementType": "group",
          "id": "/13a0c0dcf86068e93be28d3bd2cb9f19454c6b764c18b3aa409cbe88fdedfc3f",
          "replicaCount": 1,
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": undefined,
              "aggregationResult": undefined,
              "children": [],
              "collapsible": false,
              "elementType": "group",
              "id": "/3867fef80ac7abe2e353fc9b9d556196acc261b790f7fae9f0f7e6756f6eb000/64af05c38af2169228d32711e4987d231887eb1eba6f7aeada017c73b76e939b",
              "replicaCount": 1,
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
          "collapsible": false,
          "elementType": "group",
          "id": "/3867fef80ac7abe2e353fc9b9d556196acc261b790f7fae9f0f7e6756f6eb000",
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": undefined,
              "aggregationResult": undefined,
              "children": [],
              "collapsible": false,
              "elementType": "group",
              "id": "/2532e1cba3f131e7b41394f05d41fa7d586ac0cd6d53994e39a885187ad0608a/c3d60875bbe6b4b51e361979a4f1760d4213d6f18908662d6e76f080e1b11a16",
              "replicaCount": 1,
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
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/2532e1cba3f131e7b41394f05d41fa7d586ac0cd6d53994e39a885187ad0608a",
          "replicaCount": 1,
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
      [
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [],
          "collapsible": true,
          "elementType": "group",
          "id": "/21d8e03d750bcbeb52db19bb6370aeb239cb643bbf264b8a14b6437b4196453b",
          "replicaCount": 2,
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
        {
          "aggregationExpression": undefined,
          "aggregationResult": undefined,
          "children": [
            {
              "aggregationExpression": undefined,
              "aggregationResult": undefined,
              "children": [],
              "collapsible": false,
              "elementType": "group",
              "id": "/44abfd98e4e434bc96c1a943313814602ce3af5bfe0577a962223721bd650916/c3d60875bbe6b4b51e361979a4f1760d4213d6f18908662d6e76f080e1b11a16",
              "replicaCount": 1,
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
          ],
          "collapsible": false,
          "elementType": "group",
          "id": "/44abfd98e4e434bc96c1a943313814602ce3af5bfe0577a962223721bd650916",
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
      ]
    `);
  });
});
