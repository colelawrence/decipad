import { Element, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/computer';
import { Node as SlateNode } from 'slate';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromCodeLine = (
  block: Element
): UnparsedBlock | null => {
  if (block.type === ELEMENT_CODE_LINE) {
    return {
      type: 'unparsed-block',
      id: block.id,
      source: SlateNode.string(block),
    };
  }
  return null;
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
