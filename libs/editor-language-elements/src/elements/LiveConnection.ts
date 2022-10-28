import { AST, Computer } from '@decipad/computer';
import {
  MyElement,
  MyEditor,
  ELEMENT_LIVE_CONNECTION,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const LiveConnection: InteractiveLanguageElement = {
  type: ELEMENT_LIVE_CONNECTION,
  getParsedBlockFromElement: async (
    _editor: MyEditor,
    _computer: Computer,
    element: MyElement
  ) => {
    assertElementType(element, ELEMENT_LIVE_CONNECTION);
    const name = getNodeString(element.children[0]);
    const { id } = element;
    const expression: AST.Expression = {
      type: 'externalref',
      args: [id],
    };
    return parseElementAsVariableAssignment(element.id, name, expression);
  },
};
