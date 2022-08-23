import { ELEMENT_BUBBLE, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer, UnparsedBlock } from '@decipad/computer';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromInlineBubble = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
): Promise<UnparsedBlock[]> => {
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
