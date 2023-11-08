import {
  DataViewElement,
  DataViewHeader,
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
import { fixColumnName } from './utils/fixColumnName';
import { getColumnType } from './utils/getColumnType';
import { getRemoteComputer } from '@decipad/remote-computer';
import { editorToProgram } from '@decipad/editor-language-elements';

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
        columns: {
          description:
            'the columns from the table you want to use to the data view',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Column name',
              },
              aggregation: {
                type: 'string',
                description: 'Optional. Aggregates the data from the column',
                enum: [
                  'average',
                  'max',
                  'median',
                  'min',
                  'span',
                  'sum',
                  'stddev',
                ],
              },
              round: {
                type: 'string',
                description:
                  'Optional. The number of decimal places it rounds to. Use negative numbers to round to decimal points. Example: to round to the thousanth use "-3". When using dates you can round to "quarter", "year", "month" or "day"',
              },
            },
          },
        },
      },
      required: ['tableId', 'columns'],
    },
  },
  validateParams: (params): params is ActionParams<'appendDataView'> =>
    typeof params.tableId === 'string' &&
    Array.isArray(params.columns) &&
    params.columns.every((col) => col != null && typeof col === 'object'),
  handler: async (editor, { tableId, columns: _columns }) => {
    const [table] = getTableById(editor, tableId);
    const computer = getRemoteComputer();
    const program = await editorToProgram(editor, editor.children, computer);
    computer.pushCompute({
      program,
    });

    const tableName = getNodeString(table.children[0].children[0]);
    const columns = _columns.map((column) => ({
      ...column,
      name: fixColumnName(column.name),
    }));

    const headers: DataViewHeader[] = await Promise.all(
      columns.map(async ({ name: columnName, aggregation, round }) => ({
        type: ELEMENT_DATA_VIEW_TH,
        id: nanoid(),
        cellType: await getColumnType(computer, table, columnName),
        aggregation,
        rounding: round,
        name: columnName,
        label: columnName,
        children: [{ text: '' }],
      }))
    );

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
          children: headers,
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
