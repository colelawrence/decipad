import type { TNodeEntry } from '@udecode/plate-common';
import {
  getNode,
  hasNode,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import type { MyEditor, TableCellElement } from '@decipad/editor-types';
import { ELEMENT_TD } from '@decipad/editor-types';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { notAcceptable } from '@hapi/boom';
import { nanoid } from 'nanoid';
import { getDefined } from '@decipad/utils';
import type { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { replaceText } from './utils/replaceText';

extendZodWithOpenApi(z);

export const fillColumn: Action<'fillColumn'> = {
  summary: 'fills the data on a column of the given table',
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table you want to fill' }),
      columnName: z
        .string()
        .openapi({ description: 'the name of the column you want to fill' }),
      columnData: z
        .array(z.string())
        .openapi({ description: 'the content of the column' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor: MyEditor, { tableId, columnName, columnData }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const columnIndex = getTableColumnIndexByName(table, columnName);

    if (columnData.length === 0) {
      throw notAcceptable('given column data is empty');
    }
    const [firstDatum] = columnData;
    if (firstDatum.startsWith('=')) {
      throw notAcceptable(
        'table cells cannot have formulas. Instead you can use a column formula or a code line.'
      );
    }

    withoutNormalizing(editor, () => {
      columnData.forEach((cell, rowIndex) => {
        const cellPath = [...tablePath, rowIndex + 2, columnIndex];
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

    return {
      summary: `Filled column ${columnName} on table ${tableId}`,
    };
  },
};
