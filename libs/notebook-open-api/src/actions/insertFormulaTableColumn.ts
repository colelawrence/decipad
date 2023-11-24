import {
  insertNodes,
  getNode,
  withoutNormalizing,
  TPath,
  insertText,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  ELEMENT_TH,
  ELEMENT_TABLE_COLUMN_FORMULA,
  type TableHeaderElement,
  type TableColumnFormulaElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { findColumn } from './utils/findColumn';
import { findTableColumnFormula } from './utils/findTableColumnFormula';
import { getNodeString } from '../utils/getNodeString';

export const insertFormulaTableColumn: Action<'insertFormulaTableColumn'> = {
  summary: 'inserts a calculated column to an existing table',
  response: {
    schemaName: 'CreateResult',
  },
  parameters: {
    tableId: {
      description: 'the id of the table element',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnName: {
      description:
        'the name of the new column. Must contain no spaces or weird characters',
      required: true,
      schema: {
        type: 'string',
      },
    },
    formula: {
      description: 'the Decipad language formula for this new column',
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
      formula: z.string(),
    }),
  requiresNotebook: true,
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
          columnId: column.id,
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
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement),
    };
  },
};
