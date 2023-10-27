import { hasNode, removeNodes, withoutNormalizing } from '@udecode/plate';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';

export const removeTableColumn: Action<'removeTableColumn'> = {
  summary: 'removes a column from a table',
  responses: {
    200: {
      description: 'OK',
    },
  },
  parameters: [
    {
      name: 'tableId',
      in: 'query',
      description: 'the id of the table you want to remove a column from',
      required: true,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'columnName',
      in: 'query',
      description: 'the name of the new column you want to remove',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  validateParams: (params): params is ActionParams<'removeTableColumn'> =>
    typeof params.tableId === 'string' && typeof params.columnName === 'string',
  requiresNotebook: true,
  handler: (editor, { tableId, columnName }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const removeHeaderPath = [...tablePath, 1, headerIndex];
    const rowCount = table.children.length - 2;
    withoutNormalizing(editor, () => {
      removeNodes(editor, { at: removeHeaderPath });
      for (let i = 0; i < rowCount; i += 1) {
        const removeCellPath = [...tablePath, i + 2, headerIndex];
        if (hasNode(editor, removeCellPath)) {
          removeNodes(editor, { at: removeCellPath });
        }
      }
    });
  },
};
