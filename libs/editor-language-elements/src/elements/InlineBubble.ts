import { ELEMENT_BUBBLE, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';

export const getUnparsedBlockFromInlineBubble = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type === ELEMENT_BUBBLE) {
    return [
      parseElementVariableAssignment(
        block.id,
        block.formula.name,
        block.formula.expression
      ),
    ];
  }
  return [];
};

export const InlineBubble: InteractiveLanguageElement = {
  type: ELEMENT_BUBBLE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromInlineBubble
  ),
};
