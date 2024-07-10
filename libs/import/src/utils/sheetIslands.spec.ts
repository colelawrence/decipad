import {
  buildResult,
  type Result,
  type SerializedTypes,
} from '@decipad/remote-computer';
import type { ImportResult } from '../types';
import { matrix } from './matrix';
import { findAllIslands } from './sheetIslands';

const sheetToResult = (
  m: Result.Result<'materialized-table'>['value'],
  columnCount: number
): ImportResult => {
  return {
    meta: {
      sheetId: 'sheetid',
      sourceMeta: {
        spreadsheetId: 'sheetid',
        properties: {
          sheetId: 1,
          title: 'title',
        },
        sheets: [],
      },
    },
    result: buildResult(
      {
        kind: 'table',
        columnNames: Array.from({ length: columnCount }).fill(
          'col'
        ) as string[],
        columnTypes: Array.from({ length: columnCount }).fill({
          kind: 'string',
        }) as SerializedTypes.String[],
        indexName: 'col',
      },
      m
    ),
    loading: false,
  };
};

const sheet = <T extends Result.OneResult>(
  columnCount: number,
  rowCount: number,
  fill: T
): ImportResult =>
  sheetToResult(matrix(columnCount, rowCount, fill), columnCount);

describe('findAllIslands', () => {
  it('works on an empty sheet', () => {
    expect(findAllIslands('Sheet1', sheet(0, 0, false))).toMatchInlineSnapshot(
      `[]`
    );
  });

  it('works on a one cell sheet', () => {
    expect(findAllIslands('Sheet1', sheet(1, 1, 'hey'))).toMatchInlineSnapshot(`
      [
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AA1?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "hey",
              ],
            ],
          },
        },
      ]
    `);
  });

  it('works on a one island sheet', () => {
    expect(findAllIslands('Sheet1', sheet(4, 3, 'hey'))).toMatchInlineSnapshot(`
      [
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AD3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "hey",
                "hey",
                "hey",
              ],
              [
                "hey",
                "hey",
                "hey",
              ],
              [
                "hey",
                "hey",
                "hey",
              ],
              [
                "hey",
                "hey",
                "hey",
              ],
            ],
          },
        },
      ]
    `);
  });

  it('works on a 2 island sheet', () => {
    const r = sheetToResult(
      matrix(3, 3, '1').concat(matrix(1, 3, '')).concat(matrix(3, 3, '2')),
      7
    );

    expect(findAllIslands('Sheet1', r)).toMatchInlineSnapshot(`
      [
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AC3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "1",
                "1",
                "1",
              ],
              [
                "1",
                "1",
                "1",
              ],
              [
                "1",
                "1",
                "1",
              ],
            ],
          },
        },
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!E1%3AG3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "2",
                "2",
                "2",
              ],
              [
                "2",
                "2",
                "2",
              ],
              [
                "2",
                "2",
                "2",
              ],
            ],
          },
        },
      ]
    `);
  });

  it('works on a disjoint 3 island sheet', () => {
    const columns = matrix(3, 3, '1')
      .concat(matrix(1, 3, ''))
      .concat(matrix(3, 3, '2'))
      .map((column) => [...column, ''])
      .map((column) => [...column, '3', '3']);

    const r = sheetToResult(columns, columns.length);
    const islands = findAllIslands('Sheet1', r);
    expect(islands).toHaveLength(3);

    expect(islands).toMatchInlineSnapshot(`
      [
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AC3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "1",
                "1",
                "1",
              ],
              [
                "1",
                "1",
                "1",
              ],
              [
                "1",
                "1",
                "1",
              ],
            ],
          },
        },
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A5%3AG6?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
                "col",
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
              [
                "3",
                "3",
              ],
            ],
          },
        },
        {
          "loading": false,
          "meta": {
            "sheetId": "sheetid",
            "sourceMeta": {
              "properties": {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!E1%3AG3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=",
          },
          "result": {
            "type": {
              "columnNames": [
                "col",
                "col",
                "col",
              ],
              "columnTypes": [
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
                {
                  "kind": "string",
                },
              ],
              "indexName": "col",
              "kind": "table",
            },
            "value": [
              [
                "2",
                "2",
                "2",
              ],
              [
                "2",
                "2",
                "2",
              ],
              [
                "2",
                "2",
                "2",
              ],
            ],
          },
        },
      ]
    `);
  });
});
