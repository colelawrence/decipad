import {
  hasNode,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { z } from 'zod';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';

export const removeTableColumn: Action<'removeTableColumn'> = {
  summary: 'removes a column from a table',
  parameters: {
    tableId: {
      description: 'the id of the table you want to remove a column from',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnName: {
      description: 'the name of the new column you want to remove',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  parameterSchema: () =>
    z.object({
      tableId: z.string(),
      columnName: z.string(),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const removeHeaderPath = [...tablePath, 1, headerIndex];
    const rowCount = table.children.length - 2;
    withoutNormalizing(editor, () => {
      removeNodes(editor, { at: removeHeaderPath });
      for (let i = 0; i < rowCount; i += 1) {
        const removeCellPath = [...tablePath, i + 2, headerIndex];
        if (hasNode(editor, removeCellPath)) {
          removeNodes(editor, { at: removeCellPath });
        }
      }
    });
  },
};
