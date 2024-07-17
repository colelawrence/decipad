import {
  insertNodes,
  getNode,
  withoutNormalizing,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import {
  ELEMENT_TH,
  ELEMENT_TD,
  type TableHeaderElement,
  type TableCellElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import type { Action } from './types';
import { getTableById } from './utils/getTablebyId';
import { getNodeString } from '../utils/getNodeString';

extendZodWithOpenApi(z);

export const insertFilledTableColumn: Action<'insertFilledTableColumn'> = {
  summary: 'inserts a column in an existing table and fills it',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the table element' }),
      columnName: z.string().openapi({
        description:
          'the name of the column. Must contain no spaces or weird characters',
      }),
      cells: z
        .array(z.string())
        .openapi({ description: 'the data for the column' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
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
      summary: 'Inserted a filled column in an existing table',
      createdElementId: actualElement.id ?? '',
      createdElementType: actualElement.type,
      createdElementName: getNodeString(actualElement),
    };
  },
};
