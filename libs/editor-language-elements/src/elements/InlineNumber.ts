import {
  ELEMENT_INLINE_NUMBER,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';

import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';

export const getUnparsedBlockFromInlineNumber = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type !== ELEMENT_INLINE_NUMBER) return [];

  const varName = cleanUpVarName(block.name);
  const expression = getNodeString(block);

  return [parseElementVariableAssignment(block.id, varName, expression)];
};

const cleanUpVarName = (text: string): string => text.replace(/\s/g, '_');

export const InlineNumber: InteractiveLanguageElement = {
  type: ELEMENT_INLINE_NUMBER,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromInlineNumber
  ),
};
