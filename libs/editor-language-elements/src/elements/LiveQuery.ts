import type { AST } from '@decipad/language-interfaces';
import { ELEMENT_LIVE_QUERY } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate-common';
import type { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const LiveQuery: InteractiveLanguageElement = {
  type: ELEMENT_LIVE_QUERY,
  getParsedBlockFromElement: (_editor, _computer, element) => {
    assertElementType(element, ELEMENT_LIVE_QUERY);
    const name = getNodeString(element.children[0]);
    const { id } = element;
    const expression: AST.Expression = {
      type: 'externalref',
      args: [id],
    };
    return parseElementAsVariableAssignment(element.id, name, expression);
  },
};
