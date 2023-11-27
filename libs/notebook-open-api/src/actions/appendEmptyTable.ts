import { getNode, insertNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableElement,
  TableRowElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { assertElementType } from '@decipad/editor-utils';
import { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendEmptyTable: Action<'appendEmptyTable'> = {
  summary: 'appends an empty table to the end of the notebook',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  parameterSchema: () =>
    z.object({
      tableName: z.string().openapi({
        description:
          'the name of the table you want to append. Should have no spaces or special characters.',
      }),
      columnNames: z
        .array(
          z.string().openapi({
            description:
              'Column name. Should have no spaces or special characters.',
          })
        )
        .openapi({
          description: 'the names of the columns you want this table to have',
        }),
      rowCount: z
        .number()
        .int()
        .openapi({ description: 'the number of rows for this new table' }),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableName, columnNames, rowCount }) => {
    const table: TableElement = {
      type: ELEMENT_TABLE,
      id: nanoid(),
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          id: nanoid(),
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              id: nanoid(),
              children: [{ text: tableName }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          id: nanoid(),
          children: columnNames.map((columnName) => ({
            type: ELEMENT_TH,
            id: nanoid(),
            cellType: {
              kind: 'anything',
            },
            children: [
              {
                text: columnName,
              },
            ],
          })),
        },
        ...Array.from({ length: rowCount }).map(
          (): TableRowElement => ({
            type: ELEMENT_TR,
            id: nanoid(),
            children: columnNames.map(() => ({
              type: ELEMENT_TD,
              id: nanoid(),
              children: [{ text: '' }],
            })),
          })
        ),
      ],
    };
    const insertPath = appendPath(editor);
    insertNodes(editor, [table], { at: insertPath });
    const actualTable = getDefined(getNode<TableElement>(editor, insertPath));
    assertElementType(actualTable, ELEMENT_TABLE);
    return {
      createdElementId: table.id,
      createdElementType: table.type,
      createdElementName: getNodeString(
        table.children[0].children[0].children[0]
      ),
      createdSubElements: actualTable.children[1].children.map((th) => ({
        createdElementId: th.id,
        createdElementType: th.type,
        createdElementName: getNodeString(th),
      })),
    };
  },
};
