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

export const appendFilledTable: Action<'appendFilledTable'> = {
  summary: 'appends a filled table to the end of the notebook',
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
          description: 'the column names for the table',
          type: 'array',
          items: {
            type: 'string',
            description:
              'Column name. Should have no spaces or special characters.',
          },
        },
        rowsData: {
          description: 'the data for each row in an array for each row.',
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
      required: ['tableName', 'columnNames', 'rowsData'],
    },
  },
  validateParams: (params): params is ActionParams<'appendFilledTable'> =>
    typeof params.tableName === 'string' &&
    Array.isArray(params.columnNames) &&
    params.columnNames.every((colName) => typeof colName === 'string') &&
    Array.isArray(params.rowsData) &&
    params.rowsData.every(
      (rowData) =>
        Array.isArray(rowData) &&
        rowData.every((cell) => typeof cell === 'string')
    ),
  requiresNotebook: true,
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
