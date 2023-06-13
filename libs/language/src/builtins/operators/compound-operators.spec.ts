import { runCode } from '../../run';

describe('compound operators', () => {
  it('compoundrate', async () => {
    expect(await runCode(`compoundrate(1.5%, 1 year in months)`))
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
          "numberFormat": "percentage",
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
          "d": 4096000000000000000000000000n,
          "infinite": false,
          "n": 801252030306448390395044241n,
          "s": 1n,
        },
      }
    `);
  });

  it('futurevalue', async () => {
    expect(await runCode(`futurevalue(5%, 3 years, 100k$)`))
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
              "baseSuperQuantity": "currency",
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
              "unit": "$",
            },
          ],
          Symbol(immer-draftable): true,
        },
        "value": DeciNumber {
          "d": 2n,
          "infinite": false,
          "n": 231525n,
          "s": 1n,
        },
      }
    `);

    expect(await runCode(`futurevalue(5%, 2 years, 10$)`))
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
              "baseQuantity": "USD",
              "baseSuperQuantity": "currency",
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
              "unit": "$",
            },
          ],
          Symbol(immer-draftable): true,
        },
        "value": DeciNumber {
          "d": 40n,
          "infinite": false,
          "n": 441n,
          "s": 1n,
        },
      }
    `);
  });

  it('netpresentvalue', async () => {
    expect(
      await runCode(`netpresentvalue(10%, [-800 usd, 100, 200, 300, 400, 500])`)
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
              "baseQuantity": "USD",
              "baseSuperQuantity": "currency",
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
              "unit": "usd",
            },
          ],
          Symbol(immer-draftable): true,
        },
        "value": DeciNumber {
          "d": 1771561n,
          "infinite": false,
          "n": 427202000n,
          "s": 1n,
        },
      }
    `);
  });

  it('paymentamounts', async () => {
    expect(await runCode(`paymentamounts(0.25%, 60 months, 20kusd)`))
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
              "baseQuantity": "month",
              "baseSuperQuantity": "month",
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
              "unit": "months",
            },
            Object {
              "baseSuperQuantity": "currency",
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
              "unit": "usd",
            },
          ],
          Symbol(immer-draftable): true,
        },
        "value": DeciNumber {
          "d": 214825550631925528778691730564870472943254189512697154255490349294781885178127927867308068314811328751572892051591301076570825967016788154436928526363224001n,
          "infinite": false,
          "n": 77202677320842070084124939542260752447162709475634857712774517464739094258906396393365403415740566437578644602579565053828541298350839407721846426318161200050n,
          "s": 1n,
        },
      }
    `);
  });
});
