import { ELEMENT_CODE_LINE, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer, UnparsedBlock } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromCodeLine = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
): Promise<UnparsedBlock[]> => {
  if (block.type === ELEMENT_CODE_LINE) {
    return [
      {
        type: 'unparsed-block',
        id: block.id,
        source: getNodeString(block),
      },
    ];
  }
  return [];
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
