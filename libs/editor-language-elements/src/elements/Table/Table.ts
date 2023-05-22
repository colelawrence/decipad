import { getNodeString } from '@udecode/plate';
import { MyElement, ELEMENT_TABLE, MyEditor } from '@decipad/editor-types';
import {
  Computer,
  Program,
  AST,
  decilang,
  statementToIdentifiedBlock,
} from '@decipad/computer';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../../types';
import { headerToColumn } from './headerToColumn';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (
      _editor: MyEditor,
      computer: Computer,
      table: MyElement
    ): Promise<Program> => {
      assertElementType(table, ELEMENT_TABLE);

      const [caption, headerRow, ...dataRows] = table.children;
      const tableName = getNodeString(caption.children[0]);

      const tableItself = statementToIdentifiedBlock(
        table.id,
        decilang`${{ name: tableName }} = {}`
      );

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
