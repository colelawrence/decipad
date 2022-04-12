import {
  Element,
  ELEMENT_VARIABLE_DEF,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { isExpression, parseOneBlock } from '@decipad/language';
import { Node } from 'slate';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const VariableDef = {
  type: ELEMENT_VARIABLE_DEF,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (_el: Element) => {
      const element = _el as VariableDefinitionElement;
      if (element.children.length < 2) {
        return null;
      }
      const variableName = Node.string(element.children[0]);
      const value = Node.string(element.children[1]);
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
