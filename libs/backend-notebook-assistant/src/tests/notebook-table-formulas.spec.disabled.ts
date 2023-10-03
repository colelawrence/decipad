/* eslint-disable jest/no-standalone-expect */
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import document from './__fixtures__/tables.json';
import { Document } from '@decipad/editor-types';

test('notebook assistant: table formulas', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document as Document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a formula column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a column to the table that calculates the sum of the EBITDA and Capex columns'
    );

    expect(results).toMatchObject([
      {
        newProperties: {
          cellType: undefined,
        },
        node: {
          cellType: {
            kind: 'number',
            unit: [
              {
                baseQuantity: 'usdollar',
                baseSuperQuantity: 'currency',
                exp: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                known: true,
                multiplier: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                unit: 'usdollar',
              },
            ],
          },
          children: [
            {
              text: 'EBITDA',
            },
          ],
          id: '3syUkRqRBnHrZGUZFNd81',
          type: 'th',
        },
        path: [1, 1, 2],
        properties: {
          cellType: {
            kind: 'number',
            unit: [
              {
                baseQuantity: 'usdollar',
                baseSuperQuantity: 'currency',
                exp: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                known: true,
                multiplier: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                unit: 'usdollar',
              },
            ],
          },
        },
        type: 'set_node',
      },
      {
        node: {
          cellType: {
            kind: 'table-formula',
          },
          children: [
            {
              text: 'EBITDA + Capex',
            },
          ],
          id: expect.any(String),
          type: 'th',
        },
        path: [1, 0, 4],
        type: 'insert_node',
      },
      {
        newProperties: {
          cellType: {
            kind: 'number',
            unit: [
              {
                baseQuantity: 'usdollar',
                baseSuperQuantity: 'currency',
                exp: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                known: true,
                multiplier: {
                  d: '1',
                  infinite: false,
                  n: '1',
                  s: '1',
                },
                unit: 'usdollar',
              },
            ],
          },
        },
        node: {
          children: [
            {
              text: 'EBITDA',
            },
          ],
          id: '3syUkRqRBnHrZGUZFNd81',
          type: 'th',
        },
        path: [1, 1, 2],
        properties: {
          cellType: undefined,
        },
        type: 'set_node',
      },
    ]);
  }, 360000);

  it('can change a formula column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the last column to calculate the average of the EBITDA column instead'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "newProperties": {
            "columnId": undefined,
          },
          "node": {
            "children": [
              {
                "text": "CashTax / EBITDA in %",
              },
            ],
            "columnId": "4n4YeVjxXDJzpOR5BaXI8",
            "id": "4YbXsQcR8D28yzyDbNuCM",
            "type": "table-column-formula",
          },
          "path": [
            1,
            0,
            3,
          ],
          "properties": {
            "columnId": "4n4YeVjxXDJzpOR5BaXI8",
          },
          "type": "set_node",
        },
        {
          "node": {
            "text": "CashTax / EBITDA in %",
          },
          "path": [
            1,
            0,
            3,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "CashTax / EBITDA in %",
              },
            ],
            "id": "4YbXsQcR8D28yzyDbNuCM",
            "type": "table-column-formula",
          },
          "path": [
            1,
            0,
            3,
          ],
          "type": "remove_node",
        },
        {
          "newProperties": {
            "cellType": undefined,
          },
          "node": {
            "cellType": {
              "kind": "number",
              "unit": [
                {
                  "baseQuantity": "usdollar",
                  "baseSuperQuantity": "currency",
                  "exp": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "known": true,
                  "multiplier": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "unit": "usdollar",
                },
              ],
            },
            "children": [
              {
                "text": "EBITDA",
              },
            ],
            "id": "3syUkRqRBnHrZGUZFNd81",
            "type": "th",
          },
          "path": [
            1,
            1,
            2,
          ],
          "properties": {
            "cellType": {
              "kind": "number",
              "unit": [
                {
                  "baseQuantity": "usdollar",
                  "baseSuperQuantity": "currency",
                  "exp": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "known": true,
                  "multiplier": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "unit": "usdollar",
                },
              ],
            },
          },
          "type": "set_node",
        },
        {
          "node": {
            "cellType": {
              "kind": "table-formula",
            },
            "children": [
              {
                "text": "Average EBITDA",
              },
            ],
            "id": "4YbXsQcR8D28yzyDbNuCM",
            "type": "th",
          },
          "path": [
            1,
            0,
            3,
          ],
          "type": "insert_node",
        },
        {
          "newProperties": {
            "cellType": {
              "kind": "number",
              "unit": [
                {
                  "baseQuantity": "usdollar",
                  "baseSuperQuantity": "currency",
                  "exp": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "known": true,
                  "multiplier": {
                    "d": "1",
                    "infinite": false,
                    "n": "1",
                    "s": "1",
                  },
                  "unit": "usdollar",
                },
              ],
            },
          },
          "node": {
            "children": [
              {
                "text": "EBITDA",
              },
            ],
            "id": "3syUkRqRBnHrZGUZFNd81",
            "type": "th",
          },
          "path": [
            1,
            1,
            2,
          ],
          "properties": {
            "cellType": undefined,
          },
          "type": "set_node",
        },
      ]
    `);
  }, 360000);
});
