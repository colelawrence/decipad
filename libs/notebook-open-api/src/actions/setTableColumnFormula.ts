import {
  getNode,
  insertNodes,
  setNodes,
  TNodeEntry,
  withoutNormalizing,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { TableHeaderElement } from '@decipad/editor-types';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { TableColumnFormulaElement } from '../../../editor-types/src/table';
import { replaceText } from './utils/replaceText';
import { getDefined } from '@decipad/utils';

extendZodWithOpenApi(z);

export const setTableColumnFormula: Action<'setTableColumnFormula'> = {
  summary: 'turns a column into a calculated column with a given formula',
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table you want to change' }),
      columnName: z
        .string()
        .openapi({ description: 'the name of the column you want to change' }),
      formula: z.string().openapi({
        description: 'the formula for that column in Decipad language',
      }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName, formula }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const headerRow = table.children[1];
    const header = headerRow.children[headerIndex];
    const updateHeaderIndex = [...tablePath, headerIndex + 1];
    const formulaIndex = table.children[0].children.findIndex(
      (form) => form.columnId === header.id
    );
    withoutNormalizing(editor, () => {
      if (formulaIndex < 0) {
        // need to create the formula element
        const formulaElement: TableColumnFormulaElement = {
          type: 'table-column-formula',
          id: nanoid(),
          columnId: header.id,
          children: [{ text: formula }],
        };
        const formulaPath = [
          ...tablePath,
          0,
          table.children[0].children.length,
        ];
        insertNodes(editor, formulaElement, {
          at: formulaPath,
        });
      } else {
        // change the formula
        const formulaPath = [...tablePath, 0, formulaIndex];
        const formulaEntry = [
          getDefined(getNode(editor, formulaPath)),
          formulaPath,
        ] as TNodeEntry<TableColumnFormulaElement>;
        replaceText(editor, formulaEntry, formula);
      }
      setNodes<TableHeaderElement>(
        editor,
        {
          cellType: { kind: 'table-formula' },
        },
        { at: updateHeaderIndex }
      );
    });

    return {
      summary: `Set formula for column ${columnName} on table`,
    };
  },
};
