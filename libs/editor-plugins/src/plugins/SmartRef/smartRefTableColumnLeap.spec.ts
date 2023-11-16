/**
 * To implement "full smart refs" we need a leap
 *
 * This leap entails these features:
 *
 *  - Variable names become labels
 *  - Every variable is a smart ref
 *  - Every reference to a column is a smart ref
 *
 * However, to make the leap we need to support existing notebooks.
 *
 * This test will document corner cases, and how existing notebooks react.
 *
 * To make the leap, these tests should pass, be it through a migration or another method
 *
 * If they don't pass, then surely existing models will break
 */

import { Computer, getExprRef, materializeResult } from '@decipad/computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import {
  createTPlateEditor,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyValue,
  TableCellElement,
  TableCellType,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { timeout } from '@decipad/utils';
import { BaseEditor, Editor } from 'slate';
import { createCodeLine } from '@decipad/editor-utils';
import { createSmartRefPlugin } from './createSmartRefPlugin';

it('supports a variable name with the same name as a table', async () => {
  expect(
    await run(
      createCodeLine({ id: 'codeline_id', varName: 'Column1', code: '10' }),
      mkTable('TableName', 'Column2', 'exprRef_codeline_id + 1')
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 10n,
          "s": 1n,
        },
      },
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "Column2",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 11n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('supports a table column named the same as the table (1 - does not refer to it)', async () => {
  expect(await run(mkTable('TableName', 'TableName', 'Column1 + 1')))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "TableName",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('supports a table column named the same as the table (2 - tricky name used in its own definition)', async () => {
  expect(await run(mkTable('TableName', 'TableName', 'TableName.Column1 + 1')))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "TableName",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('supports a table column named the same as the table (3 - defined before)', async () => {
  const result = await run(
    mkTable('TableName', 'TableName', '2', 'UsesTableName', 'TableName + 1')
  );
  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "TableName",
            "UsesTableName",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('supports a table column named the same as the table (4 - defined after)', async () => {
  expect(
    await run(
      mkTable(
        'TableName',
        'Column2',
        'TableName.Column1 + 1',
        'TableName',
        '99999'
      )
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "Column2",
            "TableName",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 99999n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 99999n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('supports a table column named the same as the table (5 - defined after)', async () => {
  expect(
    await run(
      mkTable(
        'TableName',
        'TableName',
        `lookup(${getExprRef('id_TableName')}, ${getExprRef(
          'id_TableName'
        )}.Column1 == 1).Column1 + 41`
      )
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "TableName",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 42n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 42n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

it('Legacy reference to a table column ID (now we use blockId + columnId for this)', async () => {
  const idOfColumn = `id_TableName_headers_${'Column2'}`;
  expect(
    await run(
      mkTable('TableName', 'Column2', '2'),
      createCodeLine({ id: 'code', code: `exprRef_${idOfColumn} + 100` })
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
            "Column2",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_id_TableName",
          "indexName": "exprRef_id_TableName",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      },
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_id_TableName",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 102n,
            "s": 1n,
          },
        ],
      },
    ]
  `);
});

const run = async (...elements: MyValue[number][]) => {
  const editor = createTPlateEditor({
    plugins: [createSmartRefPlugin()],
  });
  editor.children = elements as MyValue;

  Editor.normalize(editor as BaseEditor, { force: true });

  const computer = new Computer();
  const program = await editorToProgram(editor, editor.children, computer);

  computer.pushCompute({ program });
  await timeout(0);

  const ret = computer.results$.get();

  return Promise.all(
    Object.values(ret.blockResults).map(
      (r) => (r.result && materializeResult(r.result)) ?? r.error
    )
  );
};

const mkTable = (
  tableName: string,
  col1Name: string,
  col1Formula: string,
  col2Name?: string,
  col2Formula?: string
): TableElement => ({
  type: ELEMENT_TABLE,
  id: `id_${tableName}`,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      id: `id_${tableName}_caption`,
      children: [
        {
          type: ELEMENT_TABLE_VARIABLE_NAME,
          id: `id_${tableName}_variable_name`,
          children: [{ text: tableName }],
        },
        {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          id: `id_${col1Name}_formula`,
          columnId: `id_${tableName}_headers_${col1Name}`,
          children: [{ text: col1Formula }],
        },
        ...(col2Name && col2Formula
          ? [
              {
                type: ELEMENT_TABLE_COLUMN_FORMULA,
                id: `id_${col2Name}_formula`,
                columnId: `id_${tableName}_headers_${col2Name}`,
                children: [{ text: col2Formula }],
              } as TableColumnFormulaElement,
            ]
          : []),
      ],
    },
    {
      type: ELEMENT_TR,
      id: `id_${tableName}_headers`,
      children: [
        {
          type: ELEMENT_TH,
          id: `id_${tableName}_headers_one`,
          children: [{ text: 'Column1' }],
          cellType: { kind: 'number' } as TableCellType,
        },
        {
          type: ELEMENT_TH,
          id: `id_${tableName}_headers_${col1Name}`,
          children: [{ text: col1Name }],
          cellType: { kind: 'table-formula' } as TableCellType,
        },

        ...(col2Name && col2Formula
          ? [
              {
                type: ELEMENT_TH,
                id: `id_${tableName}_headers_${col2Name}`,
                children: [{ text: col2Name }],
                cellType: { kind: 'table-formula' } as TableCellType,
              },
            ]
          : []),
      ] as TableHeaderElement[],
    },
    {
      type: ELEMENT_TR,
      id: `id_${tableName}_row_1`,
      children: [
        {
          type: ELEMENT_TD,
          id: `id_${tableName}_row_1_one`,
          children: [{ text: '1' }],
        },
        {
          type: ELEMENT_TD,
          id: `id_${tableName}_row_1_${col1Name}`,
          children: [{ text: '' }],
        },
        ...(col2Name && col2Formula
          ? [
              {
                type: ELEMENT_TD,
                id: `id_${tableName}_row_1_${col2Name}`,
                children: [{ text: '' }],
              } as TableCellElement,
            ]
          : []),
      ],
    },
  ],
});
