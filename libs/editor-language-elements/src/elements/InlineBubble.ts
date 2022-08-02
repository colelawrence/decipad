import { ELEMENT_BUBBLE, MyEditor, MyElement } from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromInlineBubble = (
  _editor: MyEditor,
  block: MyElement
): UnparsedBlock | null => {
  if (block.type === ELEMENT_BUBBLE) {
    return {
      type: 'unparsed-block',
      id: block.id,
      source: `${block.formula.name} = ${block.formula.expression}`,
    };
  }
  return null;
};

export const InlineBubble: InteractiveLanguageElement = {
  type: ELEMENT_BUBBLE,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: getUnparsedBlockFromInlineBubble,
};
