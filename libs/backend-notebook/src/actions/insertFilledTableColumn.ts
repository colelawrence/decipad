import {
  insertNodes,
  getNode,
  withoutNormalizing,
  getNodeString,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import {
  ELEMENT_TH,
  ELEMENT_TD,
  type TableHeaderElement,
  type TableCellElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';

export const insertFilledTableColumn: Action<'insertFilledTableColumn'> = {
  summary: 'inserts a column in an existing table and fills it',
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the table element',
          type: 'string',
        },
        columnName: {
          description: 'the name of the column',
          type: 'string',
        },
        cells: {
          description: 'the data for the column',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['prompt'],
    },
  },
  parameters: [],
  validateParams: (params): params is ActionParams<'insertFilledTableColumn'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    Array.isArray(params.cells) &&
    params.cells.every((cell) => typeof cell === 'string'),
  requiresNotebook: true,
  handler: (editor, { tableId, columnName, cells }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerRow = table.children[1];
    const existingColumnCount = headerRow.children.length;
    const insertHeaderPath = [...tablePath, 1, existingColumnCount];

    const newHeader: TableHeaderElement = {
      type: ELEMENT_TH,
      id: nanoid(),
      cellType: {
        kind: 'anything',
      },
      children: [{ text: columnName }],
    };

    withoutNormalizing(editor, () => {
      insertNodes(editor, [newHeader], { at: insertHeaderPath });
      let cellIndex = -1;
      for (const cell of cells) {
        cellIndex += 1;
        const cellPath = [...tablePath, cellIndex + 2, existingColumnCount];
        const newCell: TableCellElement = {
          type: ELEMENT_TD,
          id: nanoid(),
          children: [{ text: cell }],
        };
        insertNodes(editor, [newCell], { at: cellPath });
      }
    });

    const actualElement = getDefined(
      getNode<TableHeaderElement>(editor, insertHeaderPath)
    );
    return {
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement),
    };
  },
};
