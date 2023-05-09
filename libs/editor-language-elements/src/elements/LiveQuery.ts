import { AST, Computer } from '@decipad/computer';
import { MyElement, MyEditor, ELEMENT_LIVE_QUERY } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const LiveQuery: InteractiveLanguageElement = {
  type: ELEMENT_LIVE_QUERY,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor: MyEditor, _computer: Computer, element: MyElement) => {
      assertElementType(element, ELEMENT_LIVE_QUERY);
      const name = getNodeString(element.children[0]);
      const { id } = element;
      const expression: AST.Expression = {
        type: 'externalref',
        args: [id],
      };
      return parseElementAsVariableAssignment(element.id, name, expression);
    }
  ),
};
