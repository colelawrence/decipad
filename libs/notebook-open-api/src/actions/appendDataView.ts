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
import { z } from 'zod';
import { insertNodes } from '@udecode/plate-common';
import { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { getTableById } from './utils/getTablebyId';
import { fixColumnName } from './utils/fixColumnName';
import { getColumnType } from './utils/getColumnType';
import { getRemoteComputer } from '@decipad/remote-computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import { getNodeString } from '../utils/getNodeString';

export const appendDataView: Action<'appendDataView'> = {
  summary:
    'appends a data view (pivot table) that summarizes and analyzes the data on a given table',
  returnsActionResultWithNotebookError: true,
  parameters: {
    tableId: {
      description: 'the id of the table you want to use in the data view',
      required: true,
      schema: {
        type: 'string',
      },
    },
    columns: {
      description:
        'the columns from the table you want to use to the data view',
      required: true,
      schema: {
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
  },
  response: {
    schemaName: 'CreateResult',
  },
  requiresNotebook: true,
  parameterSchema: () =>
    z.object({
      columns: z.array(
        z.object({
          name: z.string(),
          aggregation: z
            .enum(['average', 'max', 'median', 'min', 'span', 'sum', 'stddev'])
            .optional(),
          round: z.string().optional(),
        })
      ),
    }),
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
