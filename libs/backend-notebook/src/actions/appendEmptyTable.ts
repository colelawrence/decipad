import { getNode, getNodeString, insertNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
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
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';
import { getDefined } from '@decipad/utils';
import { assertElementType } from '@decipad/editor-utils';

export const appendEmptyTable: Action<'appendEmptyTable'> = {
  summary: 'appends an empty table to the end of the notebook',
  parameters: [],
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableName: {
          description:
            'the name of the table you want to append. Should have no spaces or special characters.',
          type: 'string',
        },
        columnNames: {
          description: 'the name of the table you want to append',
          type: 'array',
          items: {
            type: 'string',
            description:
              'Column name. Should have no spaces or special characters.',
          },
        },
        rowCount: {
          description: 'the number of rows for this new table',
          type: 'integer',
        },
      },
      required: ['tableName', 'columnNames', 'rowCount'],
    },
  },
  validateParams: (params): params is ActionParams<'appendEmptyTable'> =>
    typeof params.tableName === 'string' &&
    Array.isArray(params.columnNames) &&
    params.columnNames.every((colName) => typeof colName === 'string') &&
    typeof params.rowCount === 'number',
  requiresNotebook: true,
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
