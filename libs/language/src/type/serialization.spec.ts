import { N } from '@decipad/number';
import { buildType as t, Unit } from '..';
import { U } from '../utils';
import { InferError } from './InferError';
import {
  deserializeType,
  SerializedType,
  serializeType,
} from './serialization';

const meter: Unit = { unit: 'meter', exp: N(1), multiplier: N(1), known: true };
const errorCause = InferError.expectedButGot('A', 'B');

it('can stringify a type', () => {
  expect(serializeType(t.number())).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "unit": null,
    }
  `);
  expect(serializeType(t.number([meter]))).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "unit": Array [
        Object {
          "exp": DeciNumber(1),
          "known": true,
          "multiplier": DeciNumber(1),
          "unit": "meter",
        },
      ],
    }
  `);
  expect(serializeType(t.string())).toMatchInlineSnapshot(`
    Object {
      "kind": "string",
    }
  `);
  expect(serializeType(t.range(t.number()))).toMatchInlineSnapshot(`
    Object {
      "kind": "range",
      "rangeOf": Object {
        "kind": "number",
        "unit": null,
      },
    }
  `);
  expect(serializeType(t.column(t.number(), 2, 'Index')))
    .toMatchInlineSnapshot(`
    Object {
      "cellType": Object {
        "kind": "number",
        "unit": null,
      },
      "columnSize": "unknown",
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
    Object {
      "columnNames": Array [
        "hi",
      ],
      "columnTypes": Array [
        Object {
          "kind": "number",
          "unit": null,
        },
      ],
      "indexName": "Idx",
      "kind": "table",
    }
  `);
  expect(serializeType(t.row([t.number(), t.string()], ['Num', 'S'])))
    .toMatchInlineSnapshot(`
      Object {
        "kind": "row",
        "rowCellNames": Array [
          "Num",
          "S",
        ],
        "rowCellTypes": Array [
          Object {
            "kind": "number",
            "unit": null,
          },
          Object {
            "kind": "string",
          },
        ],
      }
    `);
  expect(serializeType(t.date('month'))).toMatchInlineSnapshot(`
    Object {
      "date": "month",
      "kind": "date",
    }
  `);
  expect(serializeType(t.functionPlaceholder('fname', 2)))
    .toMatchInlineSnapshot(`
      Object {
        "argCount": 2,
        "ast": null,
        "kind": "function",
        "name": "fname",
      }
    `);
  expect(serializeType(t.impossible(errorCause))).toMatchInlineSnapshot(`
    Object {
      "errorCause": ErrSpec:expected-but-got("expectedButGot" => ["A","B"]),
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
      columnSize: 123,
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
    })
  ).toMatchObject({
    rowCellNames: ['Hi', 'Hi2'],
    rowCellTypes: [{ type: 'number' }, { type: 'number' }],
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
    deserializeType({ kind: 'function', name: 'fname', argCount: 2 })
  ).toMatchObject({
    functionness: true,
    functionName: 'fname',
  });

  expect(
    deserializeType({ kind: 'type-error', errorCause: errorCause.spec })
  ).toMatchObject({ errorCause });
});
