import { buildType as t, Unit } from '..';
import { F, U } from '../utils';
import { InferError } from './InferError';
import {
  deserializeType,
  SerializedType,
  serializeType,
  SerializedUnit,
  SerializedUnits,
} from './serialization';

const meter: Unit = { unit: 'meter', exp: F(1), multiplier: F(1), known: true };
const smeter: SerializedUnit = {
  unit: 'meter',
  exp: { n: 1n, d: 1n, s: 1n },
  multiplier: { n: 1n, d: 1n, s: 1n },
  known: true,
};
const errorCause = InferError.expectedButGot('A', 'B');

function units(unit: SerializedUnit): SerializedUnits {
  return {
    type: 'units',
    args: [unit],
  };
}

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
      "unit": Object {
        "args": Array [
          Object {
            "exp": Fraction(1),
            "known": true,
            "multiplier": Fraction(1),
            "unit": "meter",
          },
        ],
        "type": "units",
      },
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
      "columnSize": 2,
      "indexedBy": "Index",
      "kind": "column",
    }
  `);

  expect(
    serializeType(
      t.table({
        indexName: 'Idx',
        length: 123,
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
      "tableLength": 123,
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
      unit: units(smeter),
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
    columnSize: 123,
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
      tableLength: 123,
      columnTypes: [unitlessNumber, unitlessNumber],
      columnNames: ['Hi', 'Hi2'],
    })
  ).toMatchObject({
    columnNames: ['Hi', 'Hi2'],
    columnTypes: [{ type: 'number' }, { type: 'number' }],
    tableLength: 123,
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
