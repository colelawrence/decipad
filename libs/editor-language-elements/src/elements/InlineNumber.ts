import {
  ELEMENT_INLINE_NUMBER,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { Computer, UnparsedBlock } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromInlineNumber = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
): Promise<UnparsedBlock[]> => {
  if (block.type !== ELEMENT_INLINE_NUMBER) return [];

  const varName = cleanUpVarName(block.name);
  const expression = cleanUpExpression(getNodeString(block));

  return [
    {
      type: 'unparsed-block',
      id: block.id,
      source: varName ? `${varName} = ${expression}` : expression,
    },
  ];
};

const cleanUpVarName = (text: string): string => text.replace(/\s/g, '_');
const cleanUpExpression = (expr: string): string =>
  expr.replace(/[\u200B-\u200D\uFEFF]/g, ' ');

export const InlineNumber: InteractiveLanguageElement = {
  type: ELEMENT_INLINE_NUMBER,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromInlineNumber
  ),
};
