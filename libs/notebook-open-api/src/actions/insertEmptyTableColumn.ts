import { getNode, insertNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { ELEMENT_TH, TableHeaderElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';
import { getNodeString } from '../utils/getNodeString';

export const insertEmptyTableColumn: Action<'insertEmptyTableColumn'> = {
  summary: 'inserts an empty column in an existing table',
  response: {
    schemaName: 'CreateResult',
  },
  parameters: {
    tableId: {
      description: 'the id of the table you want to insert a column into',
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
  },
  validateParams: (params): params is ActionParams<'insertEmptyTableColumn'> =>
    typeof params.tableId === 'string' && typeof params.columnName === 'string',
  requiresNotebook: true,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { tableId, columnName }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerRow = table.children[1];
    const insertHeaderPath = [...tablePath, 1, headerRow.children.length];

    const newHeader: TableHeaderElement = {
      type: ELEMENT_TH,
      id: nanoid(),
      cellType: {
        kind: 'anything',
      },
      children: [{ text: columnName }],
    };

    insertNodes(editor, [newHeader], { at: insertHeaderPath });
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
