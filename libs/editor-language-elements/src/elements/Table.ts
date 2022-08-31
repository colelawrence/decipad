import {
  MyElement,
  ELEMENT_TABLE,
  TableElement,
  MyEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (editor: MyEditor, computer: Computer, _element: MyElement) => {
      const element = _element as TableElement;
      const {
        id,
        name,
        expression,
        parseErrors: tableParseErrors,
      } = await getTableAstNodeFromTableElement(editor, computer, element);

      const { program, parseErrors } = parseElementVariableAssignment(
        id,
        name,
        expression
      );

      return [
        {
          program,
          parseErrors: [...tableParseErrors, ...parseErrors],
        },
      ];
    }
  ),
};
