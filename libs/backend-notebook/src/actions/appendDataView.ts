import {
  DataViewElement,
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { Action, ActionParams } from './types';
import { appendPath } from '../utils/appendPath';
import { getNodeString, insertNodes } from '@udecode/plate';
import { getTableById } from './utils/getTablebyId';

export const appendDataView: Action<'appendDataView'> = {
  summary:
    'appends a data view (pivot table) that summarizes and analyzes the data on a given table',
  parameters: [],
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  requiresNotebook: true,
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the table you want to use in the data view',
          type: 'string',
        },
        columnNames: {
          description:
            'the names of the columns from the table you want to use to the data view',
          type: 'array',
          items: {
            type: 'string',
            description: 'Column name',
          },
        },
      },
      required: ['tableId', 'columnNames'],
    },
  },
  validateParams: (params): params is ActionParams<'appendDataView'> =>
    typeof params.tableId === 'string' &&
    Array.isArray(params.columnNames) &&
    params.columnNames.every((colName) => typeof colName === 'string'),
  handler: (editor, { tableId, columnNames }) => {
    const [table] = getTableById(editor, tableId);
    const tableName = getNodeString(table.children[0].children[0]);
    const newDataView: DataViewElement = {
      type: ELEMENT_DATA_VIEW,
      id: nanoid(),
      varName: tableId,
      children: [
        {
          type: ELEMENT_DATA_VIEW_CAPTION,
          id: nanoid(),
          children: [
            {
              type: ELEMENT_DATA_VIEW_NAME,
              id: nanoid(),
              children: [{ text: `Data View for ${tableName}` }],
            },
          ],
        },
        {
          type: ELEMENT_DATA_VIEW_TR,
          id: nanoid(),
          children: columnNames.map((columnName) => ({
            type: ELEMENT_DATA_VIEW_TH,
            id: nanoid(),
            cellType: {
              kind: 'anything',
            },
            name: columnName,
            label: columnName,
            children: [{ text: '' }],
          })),
        },
      ],
    };

    insertNodes(editor, [newDataView], { at: appendPath(editor) });
    return {
      createdElementId: newDataView.id,
      createdElementType: newDataView.type,
      createdElementName: getNodeString(newDataView.children[0]),
    };
  },
};
