import { hasNode, withoutNormalizing } from '@udecode/plate';
import { Action, ActionParams, RequiresNotebookAction } from './types';
import { getTableById } from './utils/getTablebyId';
import { notAcceptable } from '@hapi/boom';
import { insertTableRow } from './insertTableRow';
import { updateTableCell } from './updateTableCell';
import { getNodeString } from '../utils/getNodeString';

export const fillRow: Action<'fillRow'> = {
  summary: 'updates the data on a table row',
  parameters: {
    tableId: {
      description: 'the id of the table you want to append a new row into',
      required: true,
      schema: {
        type: 'string',
      },
    },
    rowIndex: {
      description: 'the index of the row you want to change. starts at 0',
      required: true,
      schema: {
        type: 'integer',
      },
    },
    rowData: {
      description: 'the content of that row',
      required: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  validateParams: (params): params is ActionParams<'fillRow'> =>
    typeof params.tableId === 'string' &&
    typeof params.rowIndex === 'number' &&
    Array.isArray(params.rowData) &&
    params.rowData.every((cell) => typeof cell === 'string'),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, rowIndex, rowData }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const columnCount = table.children[1].children.length;
    if (rowData.length > columnCount) {
      throw notAcceptable(
        'row data exceeds the number of columns for this table'
      );
    }
    const rowPath = [...tablePath, rowIndex + 2];
    if (!hasNode(editor, rowPath)) {
      (insertTableRow as RequiresNotebookAction<'insertTableRow'>).handler(
        editor,
        { tableId, row: rowData }
      );
    } else {
      withoutNormalizing(editor, () => {
        rowData.forEach((cell, columnIndex) => {
          (
            updateTableCell as RequiresNotebookAction<'updateTableCell'>
          ).handler(editor, {
            tableId,
            columnName: getNodeString(table.children[1].children[columnIndex]),
            rowIndex,
            newCellContent: cell,
          });
        });
      });
    }
  },
};
