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

export const fillColumn: Action<'fillColumn'> = {
  summary: 'fills the data on a column of the given table',
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
          description: 'the id of the table you want to fill',
          type: 'string',
        },
        columnName: {
          description: 'the name of the column you want to fill',
          type: 'string',
        },
        columnData: {
          description: 'the content of the column',
          type: 'array',
          items: {
            description: 'a cell',
            type: 'string',
          },
        },
      },
      required: ['tableId', 'columnName', 'columnData'],
    },
  },
  validateParams: (params): params is ActionParams<'fillColumn'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    Array.isArray(params.columnData) &&
    params.columnData.every((cell) => typeof cell === 'string'),
  requiresNotebook: true,
  handler: (editor: MyEditor, { tableId, columnName, columnData }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const columnIndex = getTableColumnIndexByName(table, columnName);

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
