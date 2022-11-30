import { ELEMENT_EVAL, MyEditor, MyElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsSourceCode } from '../utils/parseElementAsSourceCode';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const getUnparsedBlockFromEval = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type !== ELEMENT_EVAL) return [];

  return parseElementAsSourceCode(block.id, block.result);
};

export const Eval: InteractiveLanguageElement = {
  type: ELEMENT_EVAL,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromEval
  ),
};
