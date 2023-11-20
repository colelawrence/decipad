import { removeNodes } from '@udecode/plate';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';

export const removeTableRow: Action<'removeTableRow'> = {
  summary: 'removes a row from a table',
  parameters: {
    tableId: {
      description: 'the id of the table you want to insert remove a row from',
      required: true,
      schema: {
        type: 'string',
      },
    },
    rowIndex: {
      description: 'the index of the row you want to remove. starts at 0',
      required: true,
      schema: {
        type: 'number',
      },
    },
  },
  validateParams: (params): params is ActionParams<'removeTableRow'> =>
    typeof params.tableId === 'string' && typeof params.rowIndex === 'number',
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, rowIndex }) => {
    const [, tablePath] = getTableById(editor, tableId);
    const removeRowIndex = [...tablePath, rowIndex + 2];
    removeNodes(editor, { at: removeRowIndex });
  },
};
