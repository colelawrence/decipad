import type { DataViewElement, DataViewHeader } from '@decipad/editor-types';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { insertNodes } from '@udecode/plate-common';
import { extendZodWithOpenApi } from 'zod-openapi';
import type { Action } from './types';
import { appendPath } from '../utils/appendPath';
import { getTableById } from './utils/getTablebyId';
import { fixColumnName } from './utils/fixColumnName';
import { getColumnType } from './utils/getColumnType';
import { getRemoteComputer } from '@decipad/remote-computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const appendDataView: Action<'appendDataView'> = {
  summary:
    'appends a data view (pivot table) that summarizes and analyzes the data on a given table',
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
        description: 'the id of the table you want to use in the data view',
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
            'the columns from the table you want to use to the data view',
        }),
    }),
  handler: async (editor, { tableId, columns: _columns }) => {
    const [table] = getTableById(editor, tableId);
    const computer = getRemoteComputer();
    const program = await editorToProgram(editor, editor.children, computer);
    await computer.pushProgramBlocks(program);

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
      summary: `Added a new data view for ${tableName}`,
      createdElementId: newDataView.id,
      createdElementType: newDataView.type,
      createdElementName: getNodeString(newDataView.children[0]),
    };
  },
};
