import {
  CodeLineElement,
  Element,
  ELEMENT_CODE_BLOCK,
} from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/language';
import { Node as SlateNode } from 'slate';
import { InteractiveLanguageElement } from '../types';

const getUnparsedBlockFromCodeLine = (line: CodeLineElement): UnparsedBlock => {
  return {
    type: 'unparsed-block',
    id: line.id,
    source: SlateNode.string(line),
  };
};

export const getUnparsedBlocksFromCodeBlock = (
  block: Element
): UnparsedBlock[] => {
  if (block.type === ELEMENT_CODE_BLOCK) {
    return block.children.map(getUnparsedBlockFromCodeLine);
  }
  return [];
};

export const CodeBlock: InteractiveLanguageElement = {
  type: ELEMENT_CODE_BLOCK,
  resultsInUnparsedBlock: true,
  getUnparsedBlocksFromElement: getUnparsedBlocksFromCodeBlock,
};
