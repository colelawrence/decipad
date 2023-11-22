import {
  getNode,
  hasNode,
  TNodeEntry,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Action, ActionParams, NotebookActionHandler } from './types';
import { getTableById } from './utils/getTablebyId';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { insertTableRow } from './insertTableRow';
import { replaceText } from './utils/replaceText';
import { TableCellElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { notAcceptable } from '@hapi/boom';

export const updateTableCell: Action<'updateTableCell'> = {
  summary: 'updates the content of a cell on a table',
  parameters: {
    tableId: {
      description: 'the id of the table you want to change',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnName: {
      description: 'the name of the column you want to change',
      required: true,
      schema: {
        type: 'string',
      },
    },
    rowIndex: {
      description: 'the index of the row you want to change. starts at 0',
      required: true,
      schema: {
        type: 'integer',
      },
    },
    newCellContent: {
      description: 'the new content of the cell',
      required: true,
      schema: {
        type: 'string',
      },
    },
  },
  validateParams: (params): params is ActionParams<'updateTableCell'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    typeof params.rowIndex === 'number' &&
    typeof params.newCellContent === 'string',
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName, rowIndex, newCellContent }) => {
    if (newCellContent.startsWith('=')) {
      throw notAcceptable(
        'table cells cannot have formulas. Instead you can use a column formula or a code line.'
      );
    }
    const [table, tablePath] = getTableById(editor, tableId);
    const headerIndex = getTableColumnIndexByName(table, columnName);
    const updateCellPath = [...tablePath, rowIndex + 2, headerIndex, 0];
    withoutNormalizing(editor, () => {
      while (!hasNode(editor, updateCellPath)) {
        const tableColumnCount = table.children[1].children.length;
        (insertTableRow.handler as NotebookActionHandler)(editor, {
          tableId,
          row: Array.from({ length: tableColumnCount }).map(() => ''),
        });
      }
      const entry = [
        getDefined(getNode(editor, updateCellPath)),
        updateCellPath,
      ] as TNodeEntry<TableCellElement>;
      replaceText(editor, entry, newCellContent);
    });
  },
};
