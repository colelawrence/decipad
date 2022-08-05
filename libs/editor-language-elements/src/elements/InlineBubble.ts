import { ELEMENT_BUBBLE, MyEditor, MyElement } from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/computer';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromInlineBubble = (
  _editor: MyEditor,
  block: MyElement
): UnparsedBlock[] => {
  if (block.type === ELEMENT_BUBBLE) {
    return [
      {
        type: 'unparsed-block',
        id: block.id,
        source: `${block.formula.name} = ${block.formula.expression}`,
      },
    ];
  }
  return [];
};

export const InlineBubble: InteractiveLanguageElement = {
  type: ELEMENT_BUBBLE,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromInlineBubble
  ),
};
