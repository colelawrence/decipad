import type { TNodeEntry } from '@udecode/plate-common';
import {
  getNode,
  hasNode,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { nanoid } from 'nanoid';
import { notAcceptable } from '@hapi/boom';
import type { TableCellElement } from '@decipad/editor-types';
import { ELEMENT_TD } from '@decipad/editor-types';
import { replaceText } from './utils/replaceText';
import { getDefined } from '@decipad/utils';
import type { Action, RequiresNotebookAction } from './types';
import { getTableById } from './utils/getTablebyId';
import { insertTableRow } from './insertTableRow';

extendZodWithOpenApi(z);

export const fillTable: Action<'fillTable'> = {
  summary: 'fills the table data',
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table you want to fill' }),
      rowsData: z
        .array(
          z
            .array(z.string().openapi({ description: 'a cell' }))
            .openapi({ description: 'a row of data' })
        )
        .openapi({ description: 'the content of the table, row by row' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, rowsData }, context) => {
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
            },
            context
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

    return {
      summary: `Filled table with ${rowsData.length} rows`,
    };
  },
};
