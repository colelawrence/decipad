import DeciNumber from '@decipad/number';
import { Result, SerializedTypes } from '..';
import { mapResultType } from './mapResultType';

it('Can map simple results', () => {
  const simpleResult: Result.Result = {
    value: new DeciNumber(5),
    type: {
      kind: 'number',
      unit: null,
    },
  };

  const type: SerializedTypes.Number = {
    kind: 'number',
  };

  const mappedResult = mapResultType(simpleResult, [type]);

  expect(mappedResult).toMatchInlineSnapshot(`
    Object {
      "type": Object {
        "kind": "number",
      },
      "value": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 5n,
        "s": 1n,
      },
    }
  `);
});

it('Can map tables', () => {
  const tableResult: Result.Result<'materialized-table'> = {
    value: [
      [new DeciNumber(5), new DeciNumber(100)],
      ['Something', 'Else'],
    ],
    type: {
      kind: 'materialized-table',
      indexName: null,
      columnTypes: [
        {
          kind: 'column',
          indexedBy: null,
          cellType: {
            kind: 'string',
          },
        },
        {
          kind: 'column',
          indexedBy: null,
          cellType: {
            kind: 'string',
          },
        },
      ],
      columnNames: ['FirstColumn', 'SecondColumn'],
    },
  };

  const mappedResult = mapResultType(tableResult as Result.Result, [
    {
      kind: 'number',
    },
    {
      kind: 'string',
    },
  ]);

  expect(mappedResult).toMatchInlineSnapshot(`
    Object {
      "type": Object {
        "columnNames": Array [
          "FirstColumn",
          "SecondColumn",
        ],
        "columnTypes": Array [
          Object {
            "kind": "number",
          },
          Object {
            "kind": "string",
          },
        ],
        "indexName": null,
        "kind": "materialized-table",
      },
      "value": Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 100n,
            "s": 1n,
          },
        ],
        Array [
          "Something",
          "Else",
        ],
      ],
    }
  `);
});

it('Can map columns', () => {
  const tableResult: Result.Result<'materialized-column'> = {
    value: ['5', '10'],
    type: {
      kind: 'materialized-column',
      indexedBy: null,
      cellType: {
        kind: 'string',
      },
    },
  };

  const mappedResult = mapResultType(tableResult as Result.Result, [
    {
      kind: 'number',
    },
  ]);

  expect(mappedResult).toMatchInlineSnapshot(`
    Object {
      "type": Object {
        "cellType": Object {
          "kind": "number",
        },
        "indexedBy": null,
        "kind": "materialized-column",
      },
      "value": Array [
        "5",
        "10",
      ],
    }
  `);
});
