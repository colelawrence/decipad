import { getNode, insertNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { ELEMENT_TH, TableHeaderElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const insertEmptyTableColumn: Action<'insertEmptyTableColumn'> = {
  summary: 'inserts an empty column in an existing table',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  parameterSchema: () =>
    z.object({
      tableId: z.string().openapi({
        description: 'the id of the table you want to insert a column into',
      }),
      columnName: z
        .string()
        .describe(
          'the name of the new column. Must contain no spaces or weird characters'
        ),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
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
      summary: 'Inserted an empty column in an existing table',
      createdElementId: actualElement.id,
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement),
    };
  },
};
