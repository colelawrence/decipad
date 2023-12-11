import { insertNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { ELEMENT_TD, ELEMENT_TR, TableRowElement } from '@decipad/editor-types';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';

extendZodWithOpenApi(z);

export const insertTableRow: Action<'insertTableRow'> = {
  summary: 'appends a row to the end of an existing table',
  parameterSchema: () =>
    z.object({
      tableId: z.string().openapi({
        description: 'the id of the table you want to append a new row into',
      }),
      row: z
        .array(z.string())
        .openapi({ description: 'the content of that row' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
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

    return {
      summary: 'Inserted a row',
    };
  },
};
