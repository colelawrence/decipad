import { insertNodes, getNode, getNodeString } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { ELEMENT_TH, TableHeaderElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';

export const insertEmptyTableColumn: Action<'insertEmptyTableColumn'> = {
  summary: 'inserts an empty column in an existing table',
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  parameters: [
    {
      name: 'tableId',
      in: 'query',
      description: 'the id of the table you want to insert a column into',
      required: true,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'columnName',
      in: 'query',
      description:
        'the name of the new column. Must contain no spaces or weird characters',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  validateParams: (params): params is ActionParams<'insertEmptyTableColumn'> =>
    typeof params.tableId === 'string' && typeof params.columnName === 'string',
  requiresNotebook: true,
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
