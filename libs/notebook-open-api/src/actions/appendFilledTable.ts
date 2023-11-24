import { insertNodes, getNode } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
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
import { assertElementType } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { getNodeString } from '../utils/getNodeString';

export const appendFilledTable: Action<'appendFilledTable'> = {
  summary: 'appends a filled table to the end of the notebook',
  parameters: {
    tableName: {
      description:
        'the name of the table you want to append. Should have no spaces or special characters.',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnNames: {
      description: 'the column names for the table',
      required: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          description:
            'Column name. Should have no spaces or special characters.',
        },
      },
    },
    rowsData: {
      description: 'the data for each row in an array for each row.',
      required: true,
      schema: {
        type: 'array',
        items: {
          type: 'array',
          description: 'the data for a row',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
  response: {
    schemaName: 'CreateResult',
  },
  parameterSchema: () =>
    z.object({
      tableName: z.string(),
      columnNames: z.array(z.string()),
      rowsData: z.array(z.array(z.string())),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableName, columnNames, rowsData }) => {
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
        ...rowsData.map(
          (row): TableRowElement => ({
            type: ELEMENT_TR,
            id: nanoid(),
            children: columnNames.map((__, colIndex) => ({
              type: ELEMENT_TD,
              id: nanoid(),
              children: [{ text: row[colIndex] ?? '' }],
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
