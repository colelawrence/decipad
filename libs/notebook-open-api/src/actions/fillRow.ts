import { hasNode, withoutNormalizing } from '@udecode/plate-common';
import { notAcceptable } from '@hapi/boom';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { insertTableRow } from './insertTableRow';
import { Action, RequiresNotebookAction } from './types';
import { getTableById } from './utils/getTablebyId';
import { updateTableCell } from './updateTableCell';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const fillRow: Action<'fillRow'> = {
  summary: 'updates the data on a table row',
  parameterSchema: () =>
    z.object({
      tableId: z.string().openapi({
        description: 'the id of the table you want to append a new row into',
      }),
      rowIndex: z.number().int().openapi({
        description: 'the index of the row you want to change. starts at 0',
      }),
      rowData: z
        .array(z.string())
        .openapi({ description: 'the content of that row' }),
    }),
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, rowIndex, rowData }, context) => {
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
        { tableId, row: rowData },
        context
      );
    } else {
      withoutNormalizing(editor, () => {
        rowData.forEach((cell, columnIndex) => {
          (
            updateTableCell as RequiresNotebookAction<'updateTableCell'>
          ).handler(
            editor,
            {
              tableId,
              columnName: getNodeString(
                table.children[1].children[columnIndex]
              ),
              rowIndex,
              newCellContent: cell,
            },
            context
          );
        });
      });
    }
  },
};
