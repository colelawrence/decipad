import {
  getNode,
  hasNode,
  TNodeEntry,
  withoutNormalizing,
} from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Action, NotebookActionHandler } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { insertTableRow } from './insertTableRow';
import { replaceText } from './utils/replaceText';
import { TableCellElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { notAcceptable } from '@hapi/boom';

extendZodWithOpenApi(z);

export const updateTableCell: Action<'updateTableCell'> = {
  summary: 'updates the content of a cell on a table',
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table you want to change' }),
      columnName: z
        .string()
        .openapi({ description: 'the name of the column you want to change' }),
      rowIndex: z.number().int().openapi({
        description: 'the index of the row you want to change. starts at 0',
      }),
      newCellContent: z
        .string()
        .openapi({ description: 'the new content of the cell' }),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (
    editor,
    { tableId, columnName, rowIndex, newCellContent },
    context
  ) => {
    if (newCellContent.startsWith('=')) {
      throw notAcceptable(
        'table cells cannot have formulas. Instead you can use a column formula or a code line.'
      );
    }
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const updateCellPath = [...tablePath, rowIndex + 2, headerIndex];
    withoutNormalizing(editor, () => {
      while (!hasNode(editor, updateCellPath)) {
        const tableColumnCount = table.children[1].children.length;
        (insertTableRow.handler as NotebookActionHandler)(
          editor,
          {
            tableId,
            row: Array.from({ length: tableColumnCount }).map(() => ''),
          },
          context
        );
      }
      const entry = [
        getDefined(getNode(editor, updateCellPath)),
        updateCellPath,
      ] as TNodeEntry<TableCellElement>;
      replaceText(editor, entry, newCellContent);
    });
  },
};
