import {
  insertNodes,
  getNode,
  getNodeString,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import {
  ELEMENT_TH,
  ELEMENT_TABLE_COLUMN_FORMULA,
  type TableHeaderElement,
  type TableColumnFormulaElement,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { Action, ActionParams } from './types';
import { getTableById } from './utils/getTablebyId';

export const insertFormulaTableColumn: Action<'insertFormulaTableColumn'> = {
  summary: 'inserts a calculated column to an existing table',
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  parameters: [],
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the table element',
          type: 'string',
        },
        columnName: {
          description:
            'the name of the new column. Must contain no spaces or weird characters',
          type: 'string',
        },
        formula: {
          description: 'the Decipad language formula for this new column',
          type: 'string',
        },
      },
      required: ['prompt'],
    },
  },
  validateParams: (
    params
  ): params is ActionParams<'insertFormulaTableColumn'> =>
    typeof params.tableId === 'string' &&
    typeof params.columnName === 'string' &&
    typeof params.formula === 'string',
  requiresNotebook: true,
  handler: (editor, { tableId, columnName, formula }) => {
    const [table, tablePath] = getTableById(editor, tableId);
    const headerRow = table.children[1];
    const insertHeaderPath = [...tablePath, 1, headerRow.children.length];

    withoutNormalizing(editor, () => {
      const newHeader: TableHeaderElement = {
        type: ELEMENT_TH,
        id: nanoid(),
        cellType: {
          kind: 'table-formula',
        },
        children: [{ text: columnName }],
      };
      insertNodes(editor, [newHeader], { at: insertHeaderPath });

      const newFormula: TableColumnFormulaElement = {
        type: ELEMENT_TABLE_COLUMN_FORMULA,
        id: nanoid(),
        columnId: newHeader.id,
        children: [{ text: formula }],
      };
      const newFormulaIndex = table.children[0].children.length;
      const newFormulaPath = [...tablePath, 0, newFormulaIndex];
      insertNodes(editor, [newFormula], { at: newFormulaPath });
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
