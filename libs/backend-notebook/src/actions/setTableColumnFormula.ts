import {
  insertNodes,
  insertText,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { TableHeaderElement } from '@decipad/editor-types';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { TableColumnFormulaElement } from '../../../editor-types/src/table';

export const setTableColumnFormula: Action<'setTableColumnFormula'> = {
  summary: 'turns a column into a calculated column with a given formula',
  responses: {
    '200': {
      description: 'OK',
    },
  },
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the table you want to change',
          type: 'string',
        },
        columnName: {
          description: 'the name of the column you want to change',
          type: 'string',
        },
        formula: {
          description: 'the formula for that column in Decipad language',
          type: 'string',
        },
      },
      required: ['tableId', 'columnName', 'formula'],
    },
  },
  validateParams: (params): params is ActionParams<'setTableColumnFormula'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    typeof params.formula === 'string',
  requiresNotebook: true,
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
        insertText(editor, formula, { at: [...tablePath, 0, formulaIndex] });
      }
      setNodes<TableHeaderElement>(
        editor,
        {
          cellType: { kind: 'table-formula' },
        },
        { at: updateHeaderIndex }
      );
    });
  },
};
