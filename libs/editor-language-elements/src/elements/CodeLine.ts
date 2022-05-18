import { ELEMENT_CODE_LINE, MyElement } from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromCodeLine = (
  block: MyElement
): UnparsedBlock | null => {
  if (block.type === ELEMENT_CODE_LINE) {
    return {
      type: 'unparsed-block',
      id: block.id,
      source: getNodeString(block),
    };
  }
  return null;
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
