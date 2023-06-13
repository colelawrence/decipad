import { runCode } from '../../run';

describe('extract operators', () => {
  it('pick from date', async () => {
    expect(await runCode('pick(date(2020-03-15), day)')).toMatchInlineSnapshot(`
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
          "n": 15n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode('pick(date(2020-03-15), year)'))
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
          "n": 2020n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode('pick(date(2020-03-15), month)'))
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
          "n": 3n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), hour)'))
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
          "n": 18n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), minute)'))
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
          "n": 32n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), second)'))
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
          "n": 0n,
          "s": 1n,
        },
      }
    `);
  });
});
