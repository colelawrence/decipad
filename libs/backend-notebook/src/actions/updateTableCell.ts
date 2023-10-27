import { hasNode, insertText, withoutNormalizing } from '@udecode/plate';
import { Action, ActionParams, NotebookActionHandler } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { insertTableRow } from './insertTableRow';

export const updateTableCell: Action<'updateTableCell'> = {
  summary: 'updates the content of a cell on a table',
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
          description: 'the id of the table you want to change',
          type: 'string',
        },
        columnName: {
          description: 'the name of the column you want to change',
          type: 'string',
        },
        rowIndex: {
          description: 'the index of the row you want to change. starts at 0',
          type: 'integer',
        },
        newCellContent: {
          description: 'the new content of the cell',
          type: 'string',
        },
      },
      required: ['tableId', 'columnName', 'rowIndex', 'newCellContent'],
    },
  },
  validateParams: (params): params is ActionParams<'updateTableCell'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    typeof params.rowIndex === 'number' &&
    typeof params.newCellContent === 'string',
  requiresNotebook: true,
  handler: (editor, { tableId, columnName, rowIndex, newCellContent }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const updateCellIndex = [...tablePath, rowIndex + 2, headerIndex];
    withoutNormalizing(editor, () => {
      while (!hasNode(editor, updateCellIndex)) {
        const tableColumnCount = table.children[1].children.length;
        (insertTableRow.handler as NotebookActionHandler)(editor, {
          tableId,
          row: Array.from({ length: tableColumnCount }).map(() => ''),
        });
      }
      insertText(editor, newCellContent, { at: updateCellIndex });
    });
  },
};
