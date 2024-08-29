import { expect, it } from 'vitest';
import { groupIdentifiers } from './groupIdentifiers';

it('groups identifiers', () => {
  expect(
    groupIdentifiers(
      [
        {
          name: 'a',
          autocompleteGroup: 'variable',
          kind: 'number',
        },
        {
          name: 'Table1',
          autocompleteGroup: 'variable',
          kind: 'table',
        },
        {
          name: 'Column1',
          autocompleteGroup: 'column',
          kind: 'number',
          inTable: 'Table1',
        },
        {
          name: 'Column2',
          autocompleteGroup: 'column',
          kind: 'number',
          inTable: 'Table1',
        },
      ],

      false,
      null,
      ''
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "items": [
          {
            "autocompleteGroup": "variable",
            "focused": false,
            "kind": "number",
            "name": "a",
          },
        ],
        "tableName": undefined,
        "title": "Variables",
      },
      {
        "items": [
          {
            "autocompleteGroup": "variable",
            "focused": false,
            "inTable": "Table1",
            "kind": "table",
            "name": "Table1",
          },
          {
            "autocompleteGroup": "column",
            "focused": false,
            "inTable": "Table1",
            "kind": "number",
            "name": "Column1",
          },
          {
            "autocompleteGroup": "column",
            "focused": false,
            "inTable": "Table1",
            "kind": "number",
            "name": "Column2",
          },
        ],
        "tableName": "Table1",
        "title": "Table1",
      },
    ]
  `);
});

it('Places my table columns first', () => {
  expect(
    groupIdentifiers(
      [
        {
          name: 'a',
          autocompleteGroup: 'variable',
          kind: 'number',
        },
        {
          name: 'Table1',
          autocompleteGroup: 'variable',
          kind: 'table',
        },
        {
          name: 'Column1',
          blockId: 'tableid',
          columnId: 'column1id',
          autocompleteGroup: 'column',
          kind: 'number',
          inTable: 'Table1',
        },
        {
          name: 'Column2',
          blockId: 'tableid',
          columnId: 'column2id',
          autocompleteGroup: 'column',
          kind: 'number',
          inTable: 'Table1',
        },
      ],

      false,
      null,
      'Table1'
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "items": [
          {
            "autocompleteGroup": "variable",
            "focused": false,
            "inTable": "Table1",
            "kind": "table",
            "name": "Table1",
          },
          {
            "autocompleteGroup": "column",
            "blockId": "tableid",
            "columnId": "column1id",
            "decoration": "cell",
            "explanation": "The cell Column1",
            "focused": false,
            "inTable": "Table1",
            "isCell": true,
            "kind": "number",
            "name": "Column1",
          },
          {
            "autocompleteGroup": "column",
            "blockId": "tableid",
            "columnId": "column1id",
            "explanation": "The column Column1 from table Table1 as a list.",
            "focused": false,
            "inTable": "Table1",
            "isCell": false,
            "kind": "number",
            "name": "Table1.Column1",
          },
          {
            "autocompleteGroup": "column",
            "blockId": "tableid",
            "columnId": "column2id",
            "decoration": "cell",
            "explanation": "The cell Column2",
            "focused": false,
            "inTable": "Table1",
            "isCell": true,
            "kind": "number",
            "name": "Column2",
          },
          {
            "autocompleteGroup": "column",
            "blockId": "tableid",
            "columnId": "column2id",
            "explanation": "The column Column2 from table Table1 as a list.",
            "focused": false,
            "inTable": "Table1",
            "isCell": false,
            "kind": "number",
            "name": "Table1.Column2",
          },
        ],
        "tableName": "Table1",
        "title": "Table1",
      },
      {
        "items": [
          {
            "autocompleteGroup": "variable",
            "focused": false,
            "kind": "number",
            "name": "a",
          },
        ],
        "tableName": undefined,
        "title": "Variables",
      },
    ]
  `);
});
