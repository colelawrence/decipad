import {
  MyElement,
  InputElement,
  ELEMENT_INPUT,
  MyEditor,
} from '@decipad/editor-types';
import { Computer, isExpression, parseOneBlock } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const Input: InteractiveLanguageElement = {
  type: ELEMENT_INPUT,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor: MyEditor, _computer: Computer, element: MyElement) => {
      const { variableName, value, id } = element as InputElement;
      if (!variableName) {
        return [];
      }
      try {
        const block = parseOneBlock(value);
        if (block.args.length === 1 && isExpression(block.args[0])) {
          return [{ id, name: variableName, expression: block.args[0] }];
        }
        // eslint-disable-next-line no-empty
      } catch {}

      return [];
    }
  ),
};
