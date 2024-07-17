import type { TPath } from '@udecode/plate-common';
import {
  insertNodes,
  getNode,
  withoutNormalizing,
  insertText,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import {
  ELEMENT_TH,
  ELEMENT_TABLE_COLUMN_FORMULA,
  type TableHeaderElement,
  type TableColumnFormulaElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import type { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { findColumn } from './utils/findColumn';
import { findTableColumnFormula } from './utils/findTableColumnFormula';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const insertFormulaTableColumn: Action<'insertFormulaTableColumn'> = {
  summary: 'inserts a calculated column to an existing table',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table element' }),
      columnName: z.string().openapi({
        description:
          'the name of the new column. Must contain no spaces or weird characters',
      }),
      formula: z.string().openapi({
        description: 'the Decipad language formula for this new column',
      }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName, formula }) => {
    const tableEntry = getTableById(editor, tableId);
    const [table, tablePath] = tableEntry;

    let columnEntry = findColumn(editor, tableEntry, columnName);
    let column = columnEntry?.[0];
    let columnPath: TPath | undefined = columnEntry?.[1];

    withoutNormalizing(editor, () => {
      const headerRow = table.children[1];
      if (column == null) {
        columnPath = [...tablePath, 1, headerRow.children.length];
        // create a new column
        column = {
          type: ELEMENT_TH,
          id: nanoid(),
          cellType: {
            kind: 'table-formula',
          },
          children: [{ text: columnName }],
        };
        insertNodes(editor, [column], { at: columnPath });
        columnEntry = [column, columnPath];
      }

      const formulaEntry = findTableColumnFormula(
        editor,
        getDefined(columnEntry)
      );

      if (formulaEntry) {
        // formula already exists. change it
        const formulaTextPath = [...formulaEntry[1], 0];
        insertText(editor, formula, { at: formulaTextPath });
      } else {
        const newFormula: TableColumnFormulaElement = {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          id: nanoid(),
          columnId: column.id ?? '',
          children: [{ text: formula }],
        };
        const newFormulaIndex = table.children[0].children.length;
        const newFormulaPath = [...tablePath, 0, newFormulaIndex];
        insertNodes(editor, [newFormula], { at: newFormulaPath });
      }
    });
    const actualElement = getDefined(
      getNode<TableHeaderElement>(editor, getDefined(columnPath))
    );
    return {
      summary: 'Inserted a calculated column in an existing table',
      createdElementId: actualElement.id ?? '',
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement),
    };
  },
};
