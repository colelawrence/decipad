import { getComputer } from '@decipad/computer';
import type { TableElement } from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { N } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { Table } from './Table';
import { createTestEditorController } from '../../testEditorController';

const getParsedBlockFromElement = getDefined(Table.getParsedBlockFromElement);

describe('Table', () => {
  const editor = createTestEditorController('id');
  it('converts table element into table AST node', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: {
                kind: 'number',
                unit: [
                  {
                    unit: 'bananas',
                    exp: N(1),
                    multiplier: N(1),
                    known: false,
                  },
                ],
              },
              children: [{ text: 'column1' }],
            },
            {
              id: 'th2',
              type: ELEMENT_TH,
              cellType: { kind: 'string' },
              children: [{ text: 'column2' }],
            },
            {
              id: 'th3',
              type: ELEMENT_TH,
              cellType: { kind: 'date', date: 'day' },
              children: [{ text: 'column3' }],
            },
          ],
        },
        // data rows
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td11',
              children: [{ text: '1' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td12',
              children: [{ text: 'string 1' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td13',
              children: [{ text: '2022-01-01' }],
            },
          ],
        },
        {
          id: 'tr3',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td21',
              children: [{ text: '2' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td22',
              children: [{ text: 'string 2' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td23',
              children: [{ text: '2022-02-01' }],
            },
          ],
        },
        {
          id: 'tr4',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td31',
              children: [{ text: '3' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td32',
              children: [{ text: 'string 3' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td33',
              children: [{ text: '2022-03-01' }],
            },
          ],
        },
      ],
    };

    const result = await getParsedBlockFromElement(editor, getComputer(), node);

    expect(
      result.map((ex) => ({
        blockId: ex.id,
        column: ex.block?.args[0],
        errors: ex.type === 'identified-error' && ex.error,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "blockId": "table1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                  3,
                ],
                "type": "tabledef",
              },
            ],
            "type": "table",
          },
          "errors": false,
        },
        {
          "blockId": "th1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column1",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          {
                            "args": [
                              "implicit*",
                            ],
                            "type": "funcref",
                          },
                          {
                            "args": [
                              {
                                "args": [
                                  "number",
                                  DeciNumber {
                                    "d": 1n,
                                    "infinite": false,
                                    "n": 1n,
                                    "s": 1n,
                                  },
                                ],
                                "type": "literal",
                              },
                              {
                                "args": [
                                  "bananas",
                                ],
                                "end": {
                                  "char": 6,
                                  "column": 7,
                                  "line": 1,
                                },
                                "start": {
                                  "char": 0,
                                  "column": 1,
                                  "line": 1,
                                },
                                "type": "ref",
                              },
                            ],
                            "type": "argument-list",
                          },
                        ],
                        "type": "function-call",
                      },
                      {
                        "args": [
                          {
                            "args": [
                              "implicit*",
                            ],
                            "type": "funcref",
                          },
                          {
                            "args": [
                              {
                                "args": [
                                  "number",
                                  DeciNumber {
                                    "d": 1n,
                                    "infinite": false,
                                    "n": 2n,
                                    "s": 1n,
                                  },
                                ],
                                "type": "literal",
                              },
                              {
                                "args": [
                                  "bananas",
                                ],
                                "end": {
                                  "char": 6,
                                  "column": 7,
                                  "line": 1,
                                },
                                "start": {
                                  "char": 0,
                                  "column": 1,
                                  "line": 1,
                                },
                                "type": "ref",
                              },
                            ],
                            "type": "argument-list",
                          },
                        ],
                        "type": "function-call",
                      },
                      {
                        "args": [
                          {
                            "args": [
                              "implicit*",
                            ],
                            "type": "funcref",
                          },
                          {
                            "args": [
                              {
                                "args": [
                                  "number",
                                  DeciNumber {
                                    "d": 1n,
                                    "infinite": false,
                                    "n": 3n,
                                    "s": 1n,
                                  },
                                ],
                                "type": "literal",
                              },
                              {
                                "args": [
                                  "bananas",
                                ],
                                "end": {
                                  "char": 6,
                                  "column": 7,
                                  "line": 1,
                                },
                                "start": {
                                  "char": 0,
                                  "column": 1,
                                  "line": 1,
                                },
                                "type": "ref",
                              },
                            ],
                            "type": "argument-list",
                          },
                        ],
                        "type": "function-call",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              0,
              3,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
        {
          "blockId": "th2",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column2",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "string",
                          "string 1",
                        ],
                        "type": "literal",
                      },
                      {
                        "args": [
                          "string",
                          "string 2",
                        ],
                        "type": "literal",
                      },
                      {
                        "args": [
                          "string",
                          "string 3",
                        ],
                        "type": "literal",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              1,
              3,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
        {
          "blockId": "th3",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column3",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "year",
                          2022n,
                          "month",
                          1n,
                          "day",
                          1n,
                        ],
                        "type": "date",
                      },
                      {
                        "args": [
                          "year",
                          2022n,
                          "month",
                          2n,
                          "day",
                          1n,
                        ],
                        "type": "date",
                      },
                      {
                        "args": [
                          "year",
                          2022n,
                          "month",
                          3n,
                          "day",
                          1n,
                        ],
                        "type": "date",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              2,
              3,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
      ]
    `);
  });

  it('converts table formulas correctly', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
            {
              id: 'formula',
              type: ELEMENT_TABLE_COLUMN_FORMULA,
              columnId: 'th2',
              children: [{ text: '1 + 1' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: { kind: 'string' },
              children: [{ text: 'column1' }],
            },
            {
              id: 'th2',
              type: ELEMENT_TH,
              cellType: { kind: 'table-formula' },
              children: [{ text: 'column2' }],
            },
          ],
        },
        // data row
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td1',
              children: [{ text: 'Hello' }],
            },
            {
              type: ELEMENT_TD,
              id: 'td2',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    };

    expect(
      (await getParsedBlockFromElement(editor, getComputer(), node)).map(
        (ex) => ({
          blockId: ex.id,
          column: ex.block?.args[0],
          errors: ex.type === 'identified-error' && ex.error,
        })
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "blockId": "table1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                  1,
                ],
                "type": "tabledef",
              },
            ],
            "type": "table",
          },
          "errors": false,
        },
        {
          "blockId": "th1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column1",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "string",
                          "Hello",
                        ],
                        "type": "literal",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              0,
              1,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
        {
          "blockId": "th2",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column2",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      "+",
                    ],
                    "end": {
                      "char": 2,
                      "column": 3,
                      "line": 1,
                    },
                    "start": {
                      "char": 2,
                      "column": 3,
                      "line": 1,
                    },
                    "type": "funcref",
                  },
                  {
                    "args": [
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "start": {
                          "char": 0,
                          "column": 1,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 4,
                          "column": 5,
                          "line": 1,
                        },
                        "start": {
                          "char": 4,
                          "column": 5,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                    ],
                    "end": {
                      "char": 4,
                      "column": 5,
                      "line": 1,
                    },
                    "start": {
                      "char": 0,
                      "column": 1,
                      "line": 1,
                    },
                    "type": "argument-list",
                  },
                ],
                "end": {
                  "char": 4,
                  "column": 5,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "function-call",
              },
              1,
              1,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
      ]
    `);
  });

  it('converts series columns correctly', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          id: 'caption',
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: 'tableVariableName' }],
            },
          ],
        },
        // header row
        {
          id: 'tr1',
          type: ELEMENT_TR,
          children: [
            {
              id: 'th1',
              type: ELEMENT_TH,
              cellType: { kind: 'series', seriesType: 'date' },
              children: [{ text: 'column1' }],
            },
          ],
        },
        // data row
        {
          id: 'tr2',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td1',
              children: [{ text: '2020-01' }],
            },
          ],
        },
        // next month, hopefully
        {
          id: 'tr3',
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              id: 'td2',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    };

    expect(
      (await getParsedBlockFromElement(editor, getComputer(), node)).map(
        (ex) => ({
          blockId: ex.id,
          column: ex.block?.args[0],
          errors: ex.type === 'identified-error' && ex.error,
        })
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "blockId": "table1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                  2,
                ],
                "type": "tabledef",
              },
            ],
            "type": "table",
          },
          "errors": false,
        },
        {
          "blockId": "th1",
          "column": {
            "args": [
              {
                "args": [
                  "tableVariableName",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "column1",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "year",
                          2020n,
                          "month",
                          1n,
                        ],
                        "type": "date",
                      },
                      {
                        "args": [
                          "year",
                          2020n,
                          "month",
                          2n,
                        ],
                        "type": "date",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              0,
              2,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
      ]
    `);
  });

  it('define category values only if column type is category', async () => {
    const node: TableElement = {
      id: 'table1',
      type: ELEMENT_TABLE,
      children: [
        {
          children: [
            {
              children: [
                {
                  text: 'Table',
                },
              ],
              id: 'varname',
              type: ELEMENT_TABLE_VARIABLE_NAME,
            },
          ],
          id: 'tablecpation',
          type: ELEMENT_TABLE_CAPTION,
        },
        {
          children: [
            {
              children: [
                {
                  text: 'Column1',
                },
              ],
              id: 'th1',
              type: ELEMENT_TH,
              cellType: {
                kind: 'category',
              },
              categoryValues: [
                {
                  id: 'categoryValue1',
                  value: '1',
                },
                {
                  id: 'categoryValue2',
                  value: '2',
                },
                {
                  id: 'categoryValue3',
                  value: '3',
                },
              ],
            },
            {
              categoryValues: [
                {
                  id: 'categoryValue4',
                  value: 'a',
                },
                {
                  id: 'categoryValue5',
                  value: 'b',
                },
                {
                  id: 'categoryValue6',
                  value: 'c',
                },
              ],
              children: [
                {
                  text: 'Column2',
                },
              ],
              id: 'th2',
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
            },
          ],
          id: 'tr1',
          type: ELEMENT_TR,
        },
        {
          children: [
            {
              children: [
                {
                  text: 'categoryValue1',
                },
              ],
              id: 'td1',
              type: ELEMENT_TD,
            },
            {
              children: [
                {
                  text: 'categoryValue4',
                },
              ],
              id: 'td2',
              type: ELEMENT_TD,
            },
          ],
          id: 'tr2',
          type: ELEMENT_TR,
        },
      ],
    };
    const computer = getComputer();
    expect(
      (await getParsedBlockFromElement(editor, computer, node)).map((ex) => ({
        blockId: ex.id,
        column: ex.block?.args[0],
        errors: ex.type === 'identified-error' && ex.error,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "blockId": "table1",
          "column": {
            "args": [
              {
                "args": [
                  "Table",
                  1,
                ],
                "type": "tabledef",
              },
            ],
            "type": "table",
          },
          "errors": false,
        },
        {
          "blockId": "th1",
          "column": {
            "args": [
              {
                "args": [
                  "Table",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "Column1",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "exprRef_categoryValue1",
                        ],
                        "type": "ref",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              0,
              1,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
        {
          "blockId": "th2",
          "column": {
            "args": [
              {
                "args": [
                  "Table",
                ],
                "type": "tablepartialdef",
              },
              {
                "args": [
                  "Column2",
                ],
                "type": "coldef",
              },
              {
                "args": [
                  {
                    "args": [
                      {
                        "args": [
                          "string",
                          "categoryValue4",
                        ],
                        "type": "literal",
                      },
                    ],
                    "type": "column-items",
                  },
                ],
                "type": "column",
              },
              1,
              1,
            ],
            "type": "table-column-assign",
          },
          "errors": false,
        },
        {
          "blockId": "categoryValue1",
          "column": {
            "args": [
              {
                "args": [
                  "exprRef_categoryValue1",
                ],
                "type": "def",
              },
              {
                "args": [
                  "string",
                  "1",
                ],
                "end": {
                  "char": 2,
                  "column": 3,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "literal",
              },
            ],
            "type": "assign",
          },
          "errors": false,
        },
        {
          "blockId": "categoryValue2",
          "column": {
            "args": [
              {
                "args": [
                  "exprRef_categoryValue2",
                ],
                "type": "def",
              },
              {
                "args": [
                  "string",
                  "2",
                ],
                "end": {
                  "char": 2,
                  "column": 3,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "literal",
              },
            ],
            "type": "assign",
          },
          "errors": false,
        },
        {
          "blockId": "categoryValue3",
          "column": {
            "args": [
              {
                "args": [
                  "exprRef_categoryValue3",
                ],
                "type": "def",
              },
              {
                "args": [
                  "string",
                  "3",
                ],
                "end": {
                  "char": 2,
                  "column": 3,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "literal",
              },
            ],
            "type": "assign",
          },
          "errors": false,
        },
      ]
    `);
  });
});
