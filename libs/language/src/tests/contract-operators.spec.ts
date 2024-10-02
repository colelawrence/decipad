import { expect, describe, it } from 'vitest';
import { runCode } from '../run';

describe('contract operators', () => {
  it('assert to exist', async () => {
    expect(await runCode('assert(1)')).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": Type {
          "anythingness": false,
          "atParentIndex": null,
          "cellCount": undefined,
          "cellType": null,
          "columnNames": null,
          "columnTypes": null,
          "date": null,
          "delegatesIndexTo": undefined,
          "errorCause": [Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["boolean",{"node":null,"errorCause":null,"type":"number","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"symbol":null}]}],
          "functionArgNames": undefined,
          "functionBody": undefined,
          "functionName": undefined,
          "functionScopeDepth": undefined,
          "functionness": false,
          "indexName": null,
          "indexedBy": null,
          "node": {
            "args": [
              {
                "args": [
                  "assert",
                ],
                "end": {
                  "char": 5,
                  "column": 6,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "funcref",
              },
              {
                "args": [
                  {
                    "args": [
                      "number",
                      DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 1n,
                        "s": 1n,
                      },
                    ],
                    "end": {
                      "char": 7,
                      "column": 8,
                      "line": 1,
                    },
                    "inferredType": Type {
                      "anythingness": false,
                      "atParentIndex": null,
                      "cellCount": undefined,
                      "cellType": null,
                      "columnNames": null,
                      "columnTypes": null,
                      "date": null,
                      "delegatesIndexTo": undefined,
                      "errorCause": null,
                      "functionArgNames": undefined,
                      "functionBody": undefined,
                      "functionName": undefined,
                      "functionScopeDepth": undefined,
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
                      "tree": undefined,
                      "trendOf": undefined,
                      "type": "number",
                      "unit": null,
                      Symbol(immer-draftable): true,
                    },
                    "start": {
                      "char": 7,
                      "column": 8,
                      "line": 1,
                    },
                    "type": "literal",
                  },
                ],
                "end": {
                  "char": 8,
                  "column": 9,
                  "line": 1,
                },
                "start": {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "type": "argument-list",
              },
            ],
            "end": {
              "char": 8,
              "column": 9,
              "line": 1,
            },
            "start": {
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
          "tree": undefined,
          "trendOf": undefined,
          "type": null,
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "value": Symbol(unknown),
      }
    `);
  });
});
