import {
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { TableHeaderElement } from '@decipad/editor-types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { Action } from './types';

extendZodWithOpenApi(z);

export const unsetTableColumnFormula: Action<'unsetTableColumnFormula'> = {
  summary: 'turns a calculated back into a data column',
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table you want to change' }),
      columnName: z
        .string()
        .openapi({ description: 'the name of the column you want to change' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const headerRow = table.children[1];
    const header = headerRow.children[headerIndex];
    const updateHeaderIndex = [...tablePath, headerIndex + 1];
    const formulaIndex = table.children[0].children.findIndex(
      (form) => form.columnId === header.id
    );
    withoutNormalizing(editor, () => {
      if (formulaIndex >= 0) {
        // need to remove the formula element
        const formulaPath = [...tablePath, 0, formulaIndex];
        removeNodes(editor, {
          at: formulaPath,
        });
      }
      setNodes<TableHeaderElement>(
        editor,
        {
          cellType: { kind: 'anything' },
        },
        { at: updateHeaderIndex }
      );
    });

    return {
      summary: `Removed formula from column ${columnName} in table`,
    };
  },
};
