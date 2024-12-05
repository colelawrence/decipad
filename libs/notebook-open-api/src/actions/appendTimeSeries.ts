import type {
  TimeSeriesElement,
  TimeSeriesHeader,
} from '@decipad/editor-types';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_CAPTION,
  ELEMENT_TIME_SERIES_NAME,
  ELEMENT_TIME_SERIES_TH,
  ELEMENT_TIME_SERIES_TR,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { insertNodes } from '@udecode/plate-common';
import { extendZodWithOpenApi } from 'zod-openapi';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import type { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { getTableById } from './utils/getTablebyId';
import { fixColumnName } from './utils/fixColumnName';
import { getColumnType } from './utils/getColumnType';
import { editorToProgram } from '@decipad/editor-language-elements';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendTimeSeries: Action<'appendTimeSeries'> = {
  summary:
    'appends a time series (pivot table) that summarizes and analyzes the data on a given table',
  returnsActionResultWithNotebookError: true,
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  requiresNotebook: true,
  requiresRootEditor: false,
  parameterSchema: () =>
    z.object({
      tableId: z.string().openapi({
        description: 'the id of the table you want to use in the time series',
      }),
      columns: z
        .array(
          z.object({
            name: z.string().describe('Column name'),
            aggregation: z
              .enum([
                'average',
                'max',
                'median',
                'min',
                'span',
                'sum',
                'stddev',
              ])
              .optional()
              .openapi({
                description: 'Aggregates the data from the column',
              }),
            round: z.string().optional().openapi({
              description:
                'Optional. The number of decimal places it rounds to. Use negative numbers to round to decimal points. Example: to round to the thousanth use "-3". When using dates you can round to "quarter", "year", "month" or "day"',
            }),
          })
        )
        .openapi({
          description:
            'the columns from the table you want to use to the time series',
        }),
    }),
  handler: async (editor, { tableId, columns: _columns }) => {
    const [table] = getTableById(editor, tableId);
    const computer = getComputer();
    const program = await editorToProgram(editor, editor.children, computer);
    await computer.pushProgramBlocks(program);

    const tableName = getNodeString(table.children[0].children[0]);
    const columns = _columns.map((column) => ({
      ...column,
      name: fixColumnName(column.name),
    }));

    const headers: TimeSeriesHeader[] = await Promise.all(
      columns.map(async ({ name: columnName, aggregation, round }) => ({
        type: ELEMENT_TIME_SERIES_TH,
        id: nanoid(),
        cellType: await getColumnType(computer, table, columnName),
        aggregation,
        rounding: round,
        name: columnName,
        label: columnName,
        children: [{ text: '' }],
      }))
    );

    const newTimeSeries: TimeSeriesElement = {
      type: ELEMENT_TIME_SERIES,
      id: nanoid(),
      varName: tableId,
      children: [
        {
          type: ELEMENT_TIME_SERIES_CAPTION,
          id: nanoid(),
          children: [
            {
              type: ELEMENT_TIME_SERIES_NAME,
              id: nanoid(),
              children: [{ text: `Time series for ${tableName}` }],
            },
          ],
        },
        {
          type: ELEMENT_TIME_SERIES_TR,
          id: nanoid(),
          children: headers,
        },
      ],
    };

    insertNodes(editor, [newTimeSeries], { at: appendPath(editor) });
    return {
      summary: `Added a new time series for ${tableName}`,
      createdElementId: newTimeSeries.id ?? '',
      createdElementType: newTimeSeries.type,
      createdElementName: getNodeString(newTimeSeries.children[0]),
    };
  },
};
