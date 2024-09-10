import { expect, it } from 'vitest';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import type { Unit, SerializedType } from '@decipad/language-interfaces';
import { deserializeType, serializeType } from './serialization';
import { InferError } from '../InferError';
import * as t from './Type';
import { U } from '../testUtils';

setupDeciNumberSnapshotSerializer();

const meter: Unit = {
  unit: 'meter',
  exp: N(1),
  multiplier: N(1),
  known: true,
};
const errorCause = InferError.expectedButGot('A', 'B');

it('can stringify a type', () => {
  expect(serializeType(t.number())).toMatchInlineSnapshot(`
    {
      "kind": "number",
      "unit": null,
    }
  `);
  expect(serializeType(t.number([meter]))).toMatchInlineSnapshot(`
    {
      "kind": "number",
      "unit": [
        {
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
          "unit": "meter",
        },
      ],
    }
  `);
  expect(serializeType(t.string())).toMatchInlineSnapshot(`
    {
      "kind": "string",
    }
  `);
  expect(serializeType(t.range(t.number()))).toMatchInlineSnapshot(`
    {
      "kind": "range",
      "rangeOf": {
        "kind": "number",
        "unit": null,
      },
    }
  `);
  expect(serializeType(t.column(t.number(), 'Index'))).toMatchInlineSnapshot(`
    {
      "cellCount": undefined,
      "cellType": {
        "kind": "number",
        "unit": null,
      },
      "indexedBy": "Index",
      "kind": "column",
    }
  `);

  expect(
    serializeType(
      t.table({
        indexName: 'Idx',
        columnTypes: [t.number()],
        columnNames: ['hi'],
      })
    )
  ).toMatchInlineSnapshot(`
    {
      "columnNames": [
        "hi",
      ],
      "columnTypes": [
        {
          "kind": "number",
          "unit": null,
        },
      ],
      "delegatesIndexTo": undefined,
      "indexName": "Idx",
      "kind": "table",
      "rowCount": undefined,
    }
  `);
  expect(serializeType(t.row([t.number(), t.string()], ['Num', 'S'], 'Index')))
    .toMatchInlineSnapshot(`
    {
      "kind": "row",
      "rowCellNames": [
        "Num",
        "S",
      ],
      "rowCellTypes": [
        {
          "kind": "number",
          "unit": null,
        },
        {
          "kind": "string",
        },
      ],
      "rowIndexName": "Index",
    }
  `);
  expect(serializeType(t.date('month'))).toMatchInlineSnapshot(`
    {
      "date": "month",
      "kind": "date",
    }
  `);
  expect(
    serializeType(
      t.functionPlaceholder('fname', ['a', 'b'], {
        type: 'block',
        id: 'block-id',
        args: [],
      })
    )
  ).toMatchInlineSnapshot(`
    {
      "argNames": [
        "a",
        "b",
      ],
      "ast": null,
      "body": {
        "args": [],
        "id": "block-id",
        "type": "block",
      },
      "kind": "function",
      "name": "fname",
    }
  `);
  expect(serializeType(t.impossible(errorCause))).toMatchInlineSnapshot(`
    {
      "errorCause": {
        "errType": "expected-but-got",
        "expectedButGot": [
          "A",
          "B",
        ],
      },
      "errorLocation": undefined,
      "kind": "type-error",
    }
  `);
});

it('can parse a type', () => {
  const unitlessNumber: SerializedType = {
    kind: 'number',
    unit: null,
  };
  const testDeserialize = (x: SerializedType) => deserializeType(x);

  expect(testDeserialize({ kind: 'date', date: 'month' })).toMatchObject({
    date: 'month',
  });

  expect(testDeserialize(unitlessNumber)).toMatchObject({
    type: 'number',
  });

  expect(
    testDeserialize({
      kind: 'number',
      unit: [meter],
    })
  ).toMatchObject({
    type: 'number',
    unit: U(meter),
  });

  expect(testDeserialize({ kind: 'string' })).toMatchObject({
    type: 'string',
  });

  expect(testDeserialize({ kind: 'boolean' })).toMatchObject({
    type: 'boolean',
  });

  expect(
    testDeserialize({
      kind: 'range',
      rangeOf: unitlessNumber,
    })
  ).toMatchObject({
    rangeOf: {
      type: 'number',
    },
  });

  expect(
    testDeserialize({
      kind: 'column',
      indexedBy: null,
      cellType: unitlessNumber,
    })
  ).toMatchObject({
    cellType: {
      type: 'number',
    },
  });

  expect(
    testDeserialize({
      kind: 'row',
      rowCellTypes: [unitlessNumber, unitlessNumber],
      rowCellNames: ['Hi', 'Hi2'],
      rowIndexName: 'Index',
    })
  ).toMatchObject({
    rowCellNames: ['Hi', 'Hi2'],
    rowCellTypes: [{ type: 'number' }, { type: 'number' }],
    rowIndexName: 'Index',
  });

  expect(
    testDeserialize({
      kind: 'table',
      indexName: null,
      columnTypes: [unitlessNumber, unitlessNumber],
      columnNames: ['Hi', 'Hi2'],
    })
  ).toMatchObject({
    columnNames: ['Hi', 'Hi2'],
    columnTypes: [{ type: 'number' }, { type: 'number' }],
  });

  expect(
    deserializeType({
      kind: 'function',
      name: 'fname',
      argNames: ['a', 'b'],
      body: {
        type: 'block',
        id: 'body-block-id',
        args: [{ type: 'literal', args: ['number', N(1)] }],
      },
    })
  ).toMatchObject({
    functionness: true,
    functionName: 'fname',
    functionArgNames: ['a', 'b'],
    functionBody: {
      type: 'block',
      id: 'body-block-id',
      args: [{ type: 'literal', args: ['number', N(1)] }],
    },
  });

  expect(
    deserializeType({ kind: 'type-error', errorCause: errorCause.spec })
  ).toMatchObject({ errorCause });
});
