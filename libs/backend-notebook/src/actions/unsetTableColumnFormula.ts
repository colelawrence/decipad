import { getTableById } from './utils/getTablebyId';
import { removeNodes, setNodes, withoutNormalizing } from '@udecode/plate';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { TableHeaderElement } from '@decipad/editor-types';
import { Action, ActionParams } from './types';

export const unsetTableColumnFormula: Action<'unsetTableColumnFormula'> = {
  summary: 'turns a calculated back into a data column',
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
      },
      required: ['tableId', 'columnName', 'formula'],
    },
  },
  validateParams: (params): params is ActionParams<'unsetTableColumnFormula'> =>
    typeof params.tableId === 'string' && typeof params.columnName === 'string',
  requiresNotebook: true,
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
  },
};
