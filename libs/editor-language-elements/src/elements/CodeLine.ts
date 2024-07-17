import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { getCodeLineSource } from '@decipad/editor-utils';
import type { InteractiveLanguageElement } from '../types';
import { parseElementAsSourceCode } from '../utils/parseElementAsSourceCode';

export const getUnparsedBlockFromCodeLine: InteractiveLanguageElement['getParsedBlockFromElement'] =
  (_editor, _computer, block) => {
    if (block.type === ELEMENT_CODE_LINE) {
      return parseElementAsSourceCode(block.id ?? '', getCodeLineSource(block));
    }
    return [];
  };

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  getParsedBlockFromElement: getUnparsedBlockFromCodeLine,
};
