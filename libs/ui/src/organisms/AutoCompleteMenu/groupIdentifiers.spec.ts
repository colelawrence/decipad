import { groupIdentifiers } from './groupIdentifiers';

it('groups identifiers', () => {
  expect(
    groupIdentifiers(
      [
        {
          identifier: 'a',
          kind: 'variable',
          type: 'number',
        },
        {
          identifier: 'Table1',
          kind: 'variable',
          type: 'table',
        },
        {
          identifier: 'Column1',
          kind: 'column',
          type: 'number',
          inTable: 'Table1',
        },
        {
          identifier: 'Column2',
          kind: 'column',
          type: 'number',
          inTable: 'Table1',
        },
      ],

      false,
      null,
      ''
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "items": Array [
          Object {
            "focused": false,
            "identifier": "a",
            "kind": "variable",
            "type": "number",
          },
        ],
        "tableName": undefined,
        "title": "Variables",
      },
      Object {
        "items": Array [
          Object {
            "focused": false,
            "identifier": "Table1",
            "inTable": "Table1",
            "kind": "variable",
            "type": "table",
          },
          Object {
            "focused": false,
            "identifier": "Column1",
            "inTable": "Table1",
            "kind": "column",
            "type": "number",
          },
          Object {
            "focused": false,
            "identifier": "Column2",
            "inTable": "Table1",
            "kind": "column",
            "type": "number",
          },
        ],
        "tableName": "Table1",
        "title": "Table1 Table",
      },
    ]
  `);
});

it('Places my table columns first', () => {
  expect(
    groupIdentifiers(
      [
        {
          identifier: 'a',
          kind: 'variable',
          type: 'number',
        },
        {
          identifier: 'Table1',
          kind: 'variable',
          type: 'table',
        },
        {
          identifier: 'Column1',
          blockId: 'tableid',
          columnId: 'column1id',
          kind: 'column',
          type: 'number',
          inTable: 'Table1',
        },
        {
          identifier: 'Column2',
          blockId: 'tableid',
          columnId: 'column2id',
          kind: 'column',
          type: 'number',
          inTable: 'Table1',
        },
      ],

      false,
      null,
      'Table1'
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "items": Array [
          Object {
            "focused": false,
            "identifier": "Table1",
            "inTable": "Table1",
            "kind": "variable",
            "type": "table",
          },
          Object {
            "blockId": "tableid",
            "columnId": "column1id",
            "explanation": "The cell Column1",
            "focused": false,
            "identifier": "Column1",
            "inTable": "Table1",
            "kind": "column",
            "smartRef": Array [
              "column1id",
              null,
            ],
            "type": "number",
          },
          Object {
            "blockId": "tableid",
            "columnId": "column1id",
            "explanation": "The column Table1.Column1 as a list",
            "focused": false,
            "identifier": "Table1.Column1",
            "inTable": "Table1",
            "kind": "column",
            "smartRef": Array [
              "tableid",
              "column1id",
            ],
            "type": "number",
          },
          Object {
            "blockId": "tableid",
            "columnId": "column2id",
            "explanation": "The cell Column2",
            "focused": false,
            "identifier": "Column2",
            "inTable": "Table1",
            "kind": "column",
            "smartRef": Array [
              "column2id",
              null,
            ],
            "type": "number",
          },
          Object {
            "blockId": "tableid",
            "columnId": "column2id",
            "explanation": "The column Table1.Column2 as a list",
            "focused": false,
            "identifier": "Table1.Column2",
            "inTable": "Table1",
            "kind": "column",
            "smartRef": Array [
              "tableid",
              "column2id",
            ],
            "type": "number",
          },
        ],
        "tableName": "Table1",
        "title": "Table1 Table",
      },
      Object {
        "items": Array [
          Object {
            "focused": false,
            "identifier": "a",
            "kind": "variable",
            "type": "number",
          },
        ],
        "tableName": undefined,
        "title": "Variables",
      },
    ]
  `);
});
