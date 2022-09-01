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
  const expression = cleanUpExpression(getNodeString(block));

  return [parseElementVariableAssignment(block.id, varName, expression)];
};

const cleanUpVarName = (text: string): string =>
  text
    .replace(/[^\p{Letter}\p{Mark}\p{Number} ]/gu, '')
    .replace(/^([0-9])/g, '_$1')
    .replace(/\s/g, '_');

const cleanUpExpression = (expr: string): string =>
  expr.replace(/[\u200B-\u200D\uFEFF]/g, ' ');

export const InlineNumber: InteractiveLanguageElement = {
  type: ELEMENT_INLINE_NUMBER,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromInlineNumber
  ),
};
