import { buildType as t, Unit } from '..';
import { F } from '../utils';
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
  exp: { n: 1, d: 1, s: 1 },
  multiplier: { n: 1, d: 1, s: 1 },
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
  expect(serializeType(t.functionPlaceholder())).toMatchInlineSnapshot(`
    Object {
      "kind": "function",
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
  const testDeserialize = (x: SerializedType) => deserializeType(x).toString();

  expect(
    testDeserialize({ kind: 'date', date: 'month' })
  ).toMatchInlineSnapshot(`"month"`);

  expect(testDeserialize(unitlessNumber)).toMatchInlineSnapshot(`"<number>"`);

  expect(
    testDeserialize({
      kind: 'number',
      unit: units(smeter),
    })
  ).toMatchInlineSnapshot(`"meters"`);

  expect(testDeserialize({ kind: 'string' })).toMatchInlineSnapshot(
    `"<string>"`
  );

  expect(testDeserialize({ kind: 'boolean' })).toMatchInlineSnapshot(
    `"<boolean>"`
  );

  expect(
    testDeserialize({
      kind: 'range',
      rangeOf: unitlessNumber,
    })
  ).toMatchInlineSnapshot(`"range of <number>"`);

  expect(
    testDeserialize({
      kind: 'column',
      indexedBy: null,
      cellType: unitlessNumber,
      columnSize: 123,
    })
  ).toMatchInlineSnapshot(`"<number> x 123"`);

  expect(
    testDeserialize({
      kind: 'row',
      rowCellTypes: [unitlessNumber, unitlessNumber],
      rowCellNames: ['Hi', 'Hi2'],
    })
  ).toMatchInlineSnapshot(`"row [ Hi = <number>, Hi2 = <number> ]"`);

  expect(
    testDeserialize({
      kind: 'table',
      indexName: null,
      tableLength: 123,
      columnTypes: [unitlessNumber, unitlessNumber],
      columnNames: ['Hi', 'Hi2'],
    })
  ).toMatchInlineSnapshot(`"table (123) { Hi = <number>, Hi2 = <number> }"`);

  expect(deserializeType({ kind: 'function' })).toMatchObject({
    functionness: true,
  });

  expect(
    deserializeType({ kind: 'type-error', errorCause: errorCause.spec })
  ).toMatchObject({ errorCause });
});
