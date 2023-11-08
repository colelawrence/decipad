import {
  TNodeEntry,
  getNode,
  hasNode,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { Action, ActionParams, RequiresNotebookAction } from './types';
import { getTableById } from './utils/getTablebyId';
import { notAcceptable } from '@hapi/boom';
import { insertTableRow } from './insertTableRow';
import { ELEMENT_TD, MyEditor, TableCellElement } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { replaceText } from './utils/replaceText';
import { getDefined } from '@decipad/utils';

export const fillTable: Action<'fillTable'> = {
  summary: 'fills the table data',
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
          description: 'the id of the table you want to fill',
          type: 'string',
        },
        rowsData: {
          description: 'the content of the table, row by row',
          type: 'array',
          items: {
            description: 'a row of data',
            type: 'array',
            items: {
              description: 'a cell',
              type: 'string',
            },
          },
        },
      },
      required: ['tableId', 'rowsData'],
    },
  },
  validateParams: (params): params is ActionParams<'fillTable'> =>
    typeof params.tableId === 'string' &&
    Array.isArray(params.rowsData) &&
    params.rowsData.every(
      (row: unknown) =>
        Array.isArray(row) && row.every((cell) => typeof cell === 'string')
    ),
  requiresNotebook: true,
  handler: (editor: MyEditor, { tableId, rowsData }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const columnCount = table.children[1].children.length;

    withoutNormalizing(editor, () => {
      rowsData.forEach((row, rowIndex) => {
        if (row.length > columnCount) {
          throw notAcceptable(`this table only has ${columnCount} columns`);
        }
        const rowPath = [...tablePath, rowIndex + 2];
        if (!hasNode(editor, rowPath)) {
          (insertTableRow as RequiresNotebookAction<'insertTableRow'>).handler(
            editor,
            {
              tableId,
              row,
            }
          );
        }
        row.forEach((cell, columnIndex) => {
          const cellPath = [...rowPath, columnIndex];
          if (!hasNode(editor, cellPath)) {
            const newCell: TableCellElement = {
              id: nanoid(),
              type: ELEMENT_TD,
              children: [{ text: cell }],
            };
            insertNodes(editor, [newCell], { at: cellPath });
          } else {
            const entry = [
              getDefined(getNode(editor, cellPath)),
              cellPath,
            ] as TNodeEntry<TableCellElement>;
            replaceText(editor, entry, cell);
          }
        });
      });
    });
  },
};
