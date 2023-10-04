import { AST } from '@decipad/computer';
import { ELEMENT_LIVE_QUERY } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const LiveQuery: InteractiveLanguageElement = {
  type: ELEMENT_LIVE_QUERY,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor, _computer, element) => {
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
