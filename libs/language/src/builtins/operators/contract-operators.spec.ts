import { runCode } from '../../run';

describe('contract operators', () => {
  it('assert to exist', async () => {
    expect(await runCode('assert(1)')).toMatchInlineSnapshot(`
      Object {
        "type": Type {
          "anythingness": false,
          "atParentIndex": null,
          "cellType": null,
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": [Error: Inference Error: expected-but-got],
          "functionArgCount": undefined,
          "functionName": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": null,
          "node": Object {
            "args": Array [
              Object {
                "args": Array [
                  "assert",
                ],
                "end": Object {
                  "char": 5,
                  "column": 6,
                  "line": 1,
                },
                "start": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "funcref",
              },
              Object {
                "args": Array [
                  Object {
                    "args": Array [
                      "number",
                      DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 1n,
                        "s": 1n,
                      },
                    ],
                    "end": Object {
                      "char": 7,
                      "column": 8,
                      "line": 1,
                    },
                    "inferredType": Type {
                      "anythingness": false,
                      "atParentIndex": null,
                      "cellType": null,
                      "columnNames": null,
                      "columnTypes": null,
                      "date": null,
                      "delegatesIndexTo": undefined,
                      "errorCause": null,
                      "functionArgCount": undefined,
                      "functionName": undefined,
                      "functionness": false,
                      "indexName": null,
                      "indexedBy": null,
                      "node": null,
                      "nothingness": false,
                      "numberError": null,
                      "numberFormat": null,
                      "pending": false,
                      "rangeOf": null,
                      "rowCellNames": null,
                      "rowCellTypes": null,
                      "rowCount": undefined,
                      "rowIndexName": null,
                      "symbol": null,
                      "type": "number",
                      "unit": null,
                      Symbol(immer-draftable): true,
                    },
                    "start": Object {
                      "char": 7,
                      "column": 8,
                      "line": 1,
                    },
                    "type": "literal",
                  },
                ],
                "end": Object {
                  "char": 8,
                  "column": 9,
                  "line": 1,
                },
                "start": Object {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "type": "argument-list",
              },
            ],
            "end": Object {
              "char": 8,
              "column": 9,
              "line": 1,
            },
            "start": Object {
              "char": 0,
              "column": 1,
              "line": 1,
            },
            "type": "function-call",
          },
          "nothingness": false,
          "numberError": null,
          "numberFormat": null,
          "pending": false,
          "rangeOf": null,
          "rowCellNames": null,
          "rowCellTypes": null,
          "rowCount": undefined,
          "rowIndexName": null,
          "symbol": null,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": true,
      }
    `);
  });
});
