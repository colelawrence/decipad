import {
  TNodeEntry,
  getNode,
  hasNode,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';
import { ELEMENT_TD, MyEditor, TableCellElement } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getTableColumnIndexByName } from './utils/getTableColumnIndexByName';
import { replaceText } from './utils/replaceText';
import { getDefined } from '@decipad/utils';
import { notAcceptable } from '@hapi/boom';

export const fillColumn: Action<'fillColumn'> = {
  summary: 'fills the data on a column of the given table',
  parameters: {
    tableId: {
      description: 'the id of the table you want to fill',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnName: {
      description: 'the name of the column you want to fill',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columnData: {
      description: 'the content of the column',
      required: true,
      schema: {
        type: 'array',
        items: {
          description: 'a cell',
          type: 'string',
        },
      },
    },
  },
  validateParams: (params): params is ActionParams<'fillColumn'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    Array.isArray(params.columnData) &&
    params.columnData.every((cell) => typeof cell === 'string'),
  requiresNotebook: true,
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
  },
};
