import { parseUTCDate } from '../../date';
import { runCode } from '../../run';
import { fromJS, DateValue as LanguageDate, Range } from '../../value';
import { miscOperators as operators } from './misc-operators';
import { buildType as t } from '../../type';

it('knows whether a range contains a value', async () => {
  expect(
    await operators.contains.fnValues?.(
      [new Range({ start: fromJS(1), end: fromJS(2) }), fromJS(1)],
      [t.range(t.number()), t.number()]
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await operators.contains.fnValues?.(
      [new Range({ start: fromJS(1), end: fromJS(2) }), fromJS(3)],
      [t.range(t.number()), t.number()]
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);

  expect(
    await operators.contains.fnValues?.(
      [
        LanguageDate.fromDateAndSpecificity(
          parseUTCDate('2021-01-01'),
          'month'
        ),
        LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-31'), 'day'),
      ],
      [t.date('month'), t.date('day')]
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": true,
    }
  `);

  expect(
    await operators.contains.fnValues?.(
      [
        LanguageDate.fromDateAndSpecificity(parseUTCDate('2021-01-01'), 'day'),
        LanguageDate.fromDateAndSpecificity(
          parseUTCDate('2021-01-31'),
          'month'
        ),
      ],
      [t.date('day'), t.date('month')]
    )
  ).toMatchInlineSnapshot(`
    BooleanValue {
      "value": false,
    }
  `);
});

it('can un-unit stuff', async () => {
  expect(await runCode('stripunit(10 kilometers)')).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10000n,
        "s": 1n,
      },
    }
  `);
  expect(await runCode('stripunit(32891 bananas per johns miles)'))
    .toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 32891n,
        "s": 1n,
      },
    }
  `);
  expect(await runCode('stripunit(420 bruhs)')).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 420n,
        "s": 1n,
      },
    }
  `);
  expect(
    await runCode(`
      x = 420 hours
      stripunit(x)
    `)
  ).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 420n,
        "s": 1n,
      },
    }
  `);
});

it('should throw error when un-uniting non numbers', async () => {
  expect(await runCode('stripunit("not a number")')).toMatchInlineSnapshot(`
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
                "stripunit",
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
              "type": "funcref",
            },
            Object {
              "args": Array [
                Object {
                  "args": Array [
                    "string",
                    "not a number",
                  ],
                  "end": Object {
                    "char": 23,
                    "column": 24,
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
                    "type": "string",
                    "unit": null,
                    Symbol(immer-draftable): true,
                  },
                  "start": Object {
                    "char": 10,
                    "column": 11,
                    "line": 1,
                  },
                  "type": "literal",
                },
              ],
              "end": Object {
                "char": 24,
                "column": 25,
                "line": 1,
              },
              "start": Object {
                "char": 9,
                "column": 10,
                "line": 1,
              },
              "type": "argument-list",
            },
          ],
          "end": Object {
            "char": 24,
            "column": 25,
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
      "value": "not a number",
    }
  `);
});

it('removes the value and shows only the units', async () => {
  expect(await runCode('getunit(10 kilometers)')).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
        "unit": Array [
          Object {
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "known": true,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1000n,
              "s": 1n,
            },
            "unit": "meters",
          },
        ],
        Symbol(immer-draftable): true,
      },
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
    }
  `);
  expect(await runCode('getunit(32891 bananas per johns miles)'))
    .toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
        "unit": Array [
          Object {
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "known": false,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "bananas",
          },
          Object {
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": -1n,
            },
            "known": false,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "johns",
          },
          Object {
            "baseQuantity": "length",
            "baseSuperQuantity": "length",
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": -1n,
            },
            "known": true,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "miles",
          },
        ],
        Symbol(immer-draftable): true,
      },
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
    }
  `);
  expect(await runCode('getunit(420 bruhs)')).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
        "unit": Array [
          Object {
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "known": false,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "bruhs",
          },
        ],
        Symbol(immer-draftable): true,
      },
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
    }
  `);
  expect(
    await runCode(`
      x = 420 hours
      getunit(x)
    `)
  ).toMatchInlineSnapshot(`
    Object {
      "type": Type {
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
        "unit": Array [
          Object {
            "baseQuantity": "second",
            "baseSuperQuantity": "second",
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "known": true,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "hours",
          },
        ],
        Symbol(immer-draftable): true,
      },
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
    }
  `);
});
