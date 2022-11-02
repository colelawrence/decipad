import { Result, SerializedTypes } from '@decipad/computer';
import { ImportResult } from '../types';
import { matrix } from './matrix';
import { findAllIslands } from './sheetIslands';

const sheetToResult = (
  m: Result.Result<'table'>['value'],
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
    result: {
      type: {
        kind: 'table',
        columnNames: Array.from({ length: columnCount }).fill(
          'col'
        ) as string[],
        columnTypes: Array.from({ length: columnCount }).fill({
          kind: 'string',
        }) as SerializedTypes.String[],
      } as Result.Result['type'],
      value: m,
    },
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
      `Array []`
    );
  });

  it('works on a one cell sheet', () => {
    expect(findAllIslands('Sheet1', sheet(1, 1, 'hey'))).toMatchInlineSnapshot(`
      Array [
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AA1?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 1,
            },
            "value": Array [
              Array [
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
      Array [
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AD3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 3,
            },
            "value": Array [
              Array [
                "hey",
                "hey",
                "hey",
              ],
              Array [
                "hey",
                "hey",
                "hey",
              ],
              Array [
                "hey",
                "hey",
                "hey",
              ],
              Array [
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
      Array [
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AC3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 3,
            },
            "value": Array [
              Array [
                "1",
                "1",
                "1",
              ],
              Array [
                "1",
                "1",
                "1",
              ],
              Array [
                "1",
                "1",
                "1",
              ],
            ],
          },
        },
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!E1%3AG3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 3,
            },
            "value": Array [
              Array [
                "2",
                "2",
                "2",
              ],
              Array [
                "2",
                "2",
                "2",
              ],
              Array [
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
      Array [
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A1%3AC3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 3,
            },
            "value": Array [
              Array [
                "1",
                "1",
                "1",
              ],
              Array [
                "1",
                "1",
                "1",
              ],
              Array [
                "1",
                "1",
                "1",
              ],
            ],
          },
        },
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!A5%3AG6?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
                "col",
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 2,
            },
            "value": Array [
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
              Array [
                "3",
                "3",
              ],
            ],
          },
        },
        Object {
          "meta": Object {
            "sheetId": "sheetid",
            "sourceMeta": Object {
              "properties": Object {
                "sheetId": 1,
                "title": "title",
              },
              "sheets": Array [],
              "spreadsheetId": "sheetid",
            },
            "sourceUrl": "https://content-sheets.googleapis.com/v4/spreadsheets/sheetid/values/Sheet1!E1%3AG3?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM",
          },
          "result": Object {
            "type": Object {
              "columnNames": Array [
                "col",
                "col",
                "col",
              ],
              "columnTypes": Array [
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
                Object {
                  "kind": "string",
                },
              ],
              "kind": "table",
              "tableLength": 3,
            },
            "value": Array [
              Array [
                "2",
                "2",
                "2",
              ],
              Array [
                "2",
                "2",
                "2",
              ],
              Array [
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
