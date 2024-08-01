import { ELEMENT_DATA_TAB_CHILDREN } from '@decipad/editor-types';
import type { InteractiveLanguageElement } from '../types';
import { getNodeString } from '@udecode/plate-common';
import { getCodeLineSource } from '@decipad/editor-utils';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const DataTabChildren: InteractiveLanguageElement = {
  type: ELEMENT_DATA_TAB_CHILDREN,
  getParsedBlockFromElement: (_editor, _computer, block) => {
    if (block.type !== ELEMENT_DATA_TAB_CHILDREN) {
      return [];
    }

    const [nameBlock, codeBlock] = block.children;

    const varName = getNodeString(nameBlock);
    const expression = getCodeLineSource(codeBlock);

    return parseElementAsVariableAssignment(block.id, varName, expression);
  },
};
