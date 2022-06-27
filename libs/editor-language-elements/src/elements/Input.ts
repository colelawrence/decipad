import {
  MyElement,
  InputElement,
  ELEMENT_INPUT,
  MyEditor,
} from '@decipad/editor-types';
import { isExpression, parseOneBlock } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const Input: InteractiveLanguageElement = {
  type: ELEMENT_INPUT,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor: MyEditor, element: MyElement) => {
      const { variableName, value } = element as InputElement;
      if (!variableName) {
        return null;
      }
      try {
        const block = parseOneBlock(value);
        if (block.args.length === 1 && isExpression(block.args[0])) {
          return { name: variableName, expression: block.args[0] };
        }
        // eslint-disable-next-line no-empty
      } catch {}

      return null;
    }
  ),
};
