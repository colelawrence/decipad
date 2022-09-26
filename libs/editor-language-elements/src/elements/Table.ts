import { MyElement, ELEMENT_TABLE, MyEditor } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { assertElementType, astNode } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';
import { statementToProgram } from '../utils/statementToProgram';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (editor: MyEditor, computer: Computer, element: MyElement) => {
      assertElementType(element, ELEMENT_TABLE);
      const {
        id,
        name,
        expression,
        columnAssigns,
        parseErrors: tableParseErrors,
      } = await getTableAstNodeFromTableElement(editor, computer, element);

      const { program: tableProgram, parseErrors: otherTableParseErrors } =
        parseElementVariableAssignment(id, name, expression);

      const columnAssignPrograms = columnAssigns.map((columnAssign) =>
        statementToProgram(
          columnAssign.blockId,
          columnAssign.column,
          columnAssign.parseErrors
        )
      );

      const tableRefProgram = statementToProgram(
        element.id,
        astNode('ref', name),
        []
      );

      return [
        {
          program: tableProgram,
          parseErrors: [...tableParseErrors, ...otherTableParseErrors],
        },
        ...columnAssignPrograms,
        tableRefProgram,
      ];
    }
  ),
};
