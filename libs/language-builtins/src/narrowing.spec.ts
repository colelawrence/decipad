import { describe, it, expect } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { parseUnit, buildType as t } from '@decipad/language-types';
import { narrowFunctionCall, narrowTypes } from './narrowing';
import { parseFunctionSignature, parseType } from './parseType';

it('can narrow some types', async () => {
  expect(await narrowTypes(parseType('number'), parseType('number')))
    .toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
      }
    `);
  expect(await narrowTypes(parseType('boolean'), parseType('boolean')))
    .toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": "boolean",
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

  expect(
    (await narrowTypes(parseType('number'), parseType('string'))).errorCause
  ).toMatchInlineSnapshot(
    `[Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["number",{"node":null,"errorCause":null,"type":"string","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}]`
  );
});

it('can narrow percentages', async () => {
  expect(await narrowTypes(t.number(), t.number(null, 'percentage')))
    .toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
      }
    `);
  expect(await narrowTypes(t.number(null, 'percentage'), t.number()))
    .toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
      }
    `);
  expect(
    await narrowTypes(
      t.number(null, 'percentage'),
      t.number(null, 'percentage')
    )
  ).toMatchInlineSnapshot(`
    Type {
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
      "metricGranularity": undefined,
      "metricValueType": undefined,
      "metricness": false,
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
      "tree": undefined,
      "trendOf": undefined,
      "type": "number",
      "unit": null,
      Symbol(immer-draftable): true,
    }
  `);
});

it('can narrow `anything`', async () => {
  expect(await narrowTypes(parseType('column<number>'), parseType('anything')))
    .toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  expect(
    await narrowTypes(
      parseType('column<number>'),
      parseType('column<anything>')
    )
  ).toMatchInlineSnapshot(`
    Type {
      "anythingness": false,
      "atParentIndex": null,
      "cellCount": undefined,
      "cellType": Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
      "metricGranularity": undefined,
      "metricValueType": undefined,
      "metricness": false,
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
      "type": null,
      "unit": null,
      Symbol(immer-draftable): true,
    }
  `);
});

it('can narrow units', async () => {
  const meters = t.number([parseUnit('meters')]);
  expect(await narrowTypes(meters, t.number())).toMatchInlineSnapshot(`
    Type {
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
      "metricGranularity": undefined,
      "metricValueType": undefined,
      "metricness": false,
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
      "unit": [
        {
          "baseQuantity": "length",
          "baseSuperQuantity": "length",
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
          "unit": "meters",
        },
      ],
      Symbol(immer-draftable): true,
    }
  `);

  expect(await narrowTypes(meters, meters)).toMatchInlineSnapshot(`
    Type {
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
      "metricGranularity": undefined,
      "metricValueType": undefined,
      "metricness": false,
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
      "unit": [
        {
          "baseQuantity": "length",
          "baseSuperQuantity": "length",
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
          "unit": "meters",
        },
      ],
      Symbol(immer-draftable): true,
    }
  `);

  expect(
    (await narrowTypes(meters, t.number([parseUnit('seconds')]))).errorCause
  ).toMatchInlineSnapshot(
    `[Error: Inference Error: expected-unit : {"errType":"expected-unit","expectedUnit":[[{"unit":"seconds","exp":{"n":"1","d":"1","s":"1","infinite":false},"multiplier":{"n":"1","d":"1","s":"1","infinite":false},"known":true,"baseQuantity":"second","baseSuperQuantity":"second"}],[{"unit":"meters","exp":{"n":"1","d":"1","s":"1","infinite":false},"multiplier":{"n":"1","d":"1","s":"1","infinite":false},"known":true,"baseQuantity":"length","baseSuperQuantity":"length"}]]}]`
  );
});

describe('percentages', () => {
  it('can narrow percentages', async () => {
    expect(await narrowTypes(t.number(), t.number(null, 'percentage')))
      .toMatchInlineSnapshot(`
        Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        }
      `);

    expect(await narrowTypes(t.number(), t.number(null, 'percentage')))
      .toMatchInlineSnapshot(`
        Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        }
      `);

    expect(await narrowTypes(t.number(null, 'percentage'), t.number()))
      .toMatchInlineSnapshot(`
        Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        }
      `);
  });

  it('narrows with units', async () => {
    const meters = t.number([parseUnit('meters')]);
    expect(await narrowTypes(meters, t.number(null, 'percentage')))
      .toMatchInlineSnapshot(`
        Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
          "unit": [
            {
              "baseQuantity": "length",
              "baseSuperQuantity": "length",
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
              "unit": "meters",
            },
          ],
          Symbol(immer-draftable): true,
        }
      `);
  });
});

it('can narrow dates', async () => {
  expect(await narrowTypes(t.date('day'), t.date('day')))
    .toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": null,
        "columnNames": null,
        "columnTypes": null,
        "date": "day",
        "delegatesIndexTo": undefined,
        "errorCause": null,
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
        "functionness": false,
        "indexName": null,
        "indexedBy": null,
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  expect(
    (await narrowTypes(t.date('day'), t.date('hour'))).errorCause
  ).toMatchInlineSnapshot(
    `[Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["day",{"node":null,"errorCause":null,"type":null,"unit":null,"numberFormat":null,"numberError":null,"date":"hour","rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}]`
  );
});

it('explains where the error came from', async () => {
  expect(
    (
      await narrowTypes(
        parseType('column<range<number>>'),
        parseType('column<string>')
      )
    ).errorCause?.pathToError
  ).toEqual(['column']);

  expect(
    (
      await narrowTypes(
        parseType('column<range<number>>'),
        parseType('column<range<string>>')
      )
    ).errorCause?.pathToError
  ).toEqual(['column', 'range']);
});

describe('narrow func call', () => {
  it('validates args', async () => {
    expect(
      await narrowFunctionCall({
        args: [parseType('number'), parseType('number')],
        ...parseFunctionSignature('number, number -> string'),
      })
    ).toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": "string",
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      (
        await narrowFunctionCall({
          args: [parseType('string'), parseType('number')],
          ...parseFunctionSignature('number, number -> string'),
        })
      ).errorCause
    ).toMatchInlineSnapshot(
      `[Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["number",{"node":null,"errorCause":null,"type":"string","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}]`
    );
  });

  it('propagates symbols to ret', async () => {
    expect(
      await narrowFunctionCall({
        args: [parseType('number')],
        ...parseFunctionSignature('A -> A'),
      })
    ).toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A> -> column<A>'),
      })
    ).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<boolean>')],
        ...parseFunctionSignature('column<A> -> A'),
      })
    ).toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": "boolean",
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('column<number>')],
        ...parseFunctionSignature('column<A>:B -> B'),
      })
    ).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": Type {
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
          "metricGranularity": undefined,
          "metricValueType": undefined,
          "metricness": false,
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('propagates symbols to other args', async () => {
    expect(
      await narrowFunctionCall({
        args: [t.number(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": "boolean",
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [t.string(), t.number()],
        ...parseFunctionSignature('A, A -> boolean'),
      })
    ).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": null,
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": [Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["string",{"node":null,"errorCause":null,"type":"number","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}],
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
        "functionness": false,
        "indexName": null,
        "indexedBy": null,
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('string'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`
      Type {
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
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": "boolean",
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('string'), parseType('column<number>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": null,
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": [Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["string",{"node":null,"errorCause":null,"type":"number","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}],
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
        "functionness": false,
        "indexName": null,
        "indexedBy": null,
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);

    expect(
      await narrowFunctionCall({
        args: [parseType('number'), parseType('column<string>')],
        ...parseFunctionSignature('A, column<A> -> boolean'),
      })
    ).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellCount": undefined,
        "cellType": null,
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": [Error: Inference Error: expected-but-got : {"errType":"expected-but-got","expectedButGot":["number",{"node":null,"errorCause":null,"type":"string","unit":null,"numberFormat":null,"numberError":null,"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"atParentIndex":null,"columnTypes":null,"columnNames":null,"rowIndexName":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false,"pending":false,"nothingness":false,"anythingness":false,"metricness":false,"symbol":null}]}],
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
        "functionness": false,
        "indexName": null,
        "indexedBy": null,
        "metricGranularity": undefined,
        "metricValueType": undefined,
        "metricness": false,
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
});

it('cant narrow tables, rows, functions', async () => {
  const table = t.table({
    columnNames: ['X'],
    columnTypes: [t.boolean()],
  });
  const row = t.row([t.boolean()], ['X']);
  const func = t.functionPlaceholder('fname', ['X'], {
    type: 'block',
    id: 'body-block-id',
    args: [],
  });

  await expect(async () => narrowTypes(table, table)).rejects.toThrow();
  await expect(async () => narrowTypes(row, row)).rejects.toThrow();
  await expect(async () => narrowTypes(func, func)).rejects.toThrow();
});
