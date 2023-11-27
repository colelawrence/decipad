import { removeNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';

extendZodWithOpenApi(z);

export const removeTableRow: Action<'removeTableRow'> = {
  summary: 'removes a row from a table',
  parameterSchema: () =>
    z.object({
      tableId: z.string().openapi({
        description: 'the id of the table you want to insert remove a row from',
      }),
      rowIndex: z.number().int().openapi({
        description: 'the index of the row you want to remove. starts at 0',
      }),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, rowIndex }) => {
    const [, tablePath] = getTableById(editor, tableId);
    const removeRowIndex = [...tablePath, rowIndex + 2];
    removeNodes(editor, { at: removeRowIndex });
  },
};
