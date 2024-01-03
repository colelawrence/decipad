import { getNodeString } from '@udecode/plate-common';
import { ELEMENT_TABLE } from '@decipad/editor-types';
import {
  Program,
  AST,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../../types';
import { headerToColumn } from './headerToColumn';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor, computer, table): Promise<Program> => {
      assertElementType(table, ELEMENT_TABLE);

      const [caption, headerRow, ...dataRows] = table.children;
      const tableName = getNodeString(caption.children[0]);
      const rowCount = dataRows.length;

      const tableItself = statementToIdentifiedBlock(table.id, {
        type: 'table',
        args: [{ type: 'tabledef', args: [tableName, rowCount] }],
      } as AST.Table);

      const columnAssigns: Program = [];

      for (const [columnIndex, th] of headerRow.children.entries()) {
        const { columnName, errors, elementId, expression } =
          // eslint-disable-next-line no-await-in-loop
          await headerToColumn({
            computer,
            th,
            columnIndex,
            tableName,
            table,
            dataRows,
          });

        if (expression) {
          const columnAssign: AST.TableColumnAssign = {
            type: 'table-column-assign',
            args: [
              { type: 'tablepartialdef', args: [tableName] },
              { type: 'coldef', args: [columnName] },
              expression,
              columnIndex,
            ],
          };

          columnAssigns.push(
            statementToIdentifiedBlock(elementId, columnAssign),
            ...errors
          );
        } else {
          columnAssigns.push(...errors);
        }
      }

      return [tableItself, ...columnAssigns];
    }
  ),
};
