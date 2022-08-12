import { ELEMENT_EVAL, MyEditor, MyElement } from '@decipad/editor-types';
import { UnparsedBlock } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';

export const getUnparsedBlockFromEval = (
  _editor: MyEditor,
  block: MyElement
): UnparsedBlock[] => {
  if (block.type !== ELEMENT_EVAL) return [];

  return [
    {
      type: 'unparsed-block',
      id: block.id,
      source: block.result,
    },
  ];
};

export const Eval: InteractiveLanguageElement = {
  type: ELEMENT_EVAL,
  resultsInUnparsedBlock: true,
  getUnparsedBlockFromElement: getUnparsedBlockFromEval,
};
