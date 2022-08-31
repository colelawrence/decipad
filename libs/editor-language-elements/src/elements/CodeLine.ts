import { ELEMENT_CODE_LINE, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementSourceCode } from '../utils/parseElementSourceCode';

export const getUnparsedBlockFromCodeLine = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type === ELEMENT_CODE_LINE) {
    return [parseElementSourceCode(block.id, getNodeString(block))];
  }
  return [];
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  getParsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
