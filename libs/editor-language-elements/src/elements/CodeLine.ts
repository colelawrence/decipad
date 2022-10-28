import { ELEMENT_CODE_LINE, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getCodeLineSource } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsSourceCode } from '../utils/parseElementAsSourceCode';

export const getUnparsedBlockFromCodeLine = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type === ELEMENT_CODE_LINE) {
    return parseElementAsSourceCode(block.id, getCodeLineSource(block));
  }
  return [];
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  getParsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
