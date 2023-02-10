import { MyElement, ELEMENT_TABLE, MyEditor } from '@decipad/editor-types';
import { Computer, Program, getDefinedSymbol } from '@decipad/computer';
import { assertElementType } from '@decipad/editor-utils';
import { getColumnNameFromTableColumnAssign } from 'libs/computer/src/utils';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';
import { statementToIdentifiedBlock } from '../utils/statementToIdentifiedBlock';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (
      editor: MyEditor,
      computer: Computer,
      element: MyElement
    ): Promise<Program> => {
      assertElementType(element, ELEMENT_TABLE);
      const { id, expression, columnAssigns } =
        await getTableAstNodeFromTableElement(editor, computer, element);

      const tableItself = statementToIdentifiedBlock(id, expression);
      const tableName =
        getDefinedSymbol(tableItself.block.args[0]) || undefined;

      const columnAssignments = columnAssigns.flatMap((columnAssign) => [
        ...(columnAssign.column
          ? [
              statementToIdentifiedBlock(
                columnAssign.blockId,
                columnAssign.column,
                tableName,
                getColumnNameFromTableColumnAssign(columnAssign.column)
              ),
            ]
          : []),
        ...columnAssign.errors,
      ]);

      return [tableItself, ...columnAssignments];
    }
  ),
};
