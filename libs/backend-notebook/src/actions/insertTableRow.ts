import { insertNodes } from '@udecode/plate';
import { ELEMENT_TD, ELEMENT_TR, TableRowElement } from '@decipad/editor-types';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';
import { nanoid } from 'nanoid';

export const insertTableRow: Action<'insertTableRow'> = {
  summary: 'appends a row to the end of an existing table',
  responses: {
    '200': {
      description: 'OK',
    },
  },
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the table you want to append a new row into',
          type: 'string',
        },
        row: {
          description: 'the content of that row',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['tableId', 'row'],
    },
  },
  validateParams: (params): params is ActionParams<'insertTableRow'> =>
    typeof params.tableId === 'string' &&
    Array.isArray(params.row) &&
    params.row.every((cell) => typeof cell === 'string'),
  requiresNotebook: true,
  handler: (editor, { tableId, row }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const columnCount = table.children[1].children.length;

    const tr: TableRowElement = {
      id: nanoid(),
      type: ELEMENT_TR,
      children: Array.from({ length: columnCount }).map((_, colIndex) => ({
        id: nanoid(),
        type: ELEMENT_TD,
        children: [{ text: row[colIndex] ?? '' }],
      })),
    };

    const insertRowIndex = [...tablePath, table.children.length];
    insertNodes(editor, [tr], { at: insertRowIndex });
  },
};
