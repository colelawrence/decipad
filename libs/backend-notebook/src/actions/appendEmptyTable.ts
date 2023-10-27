import { getNodeString, insertNodes } from '@udecode/plate';
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
    insertNodes(editor, [table], { at: appendPath(editor) });
    return {
      createdElementId: table.id,
      createdElementType: table.type,
      createdElementName: getNodeString(
        table.children[0].children[0].children[0]
      ),
    };
  },
};
