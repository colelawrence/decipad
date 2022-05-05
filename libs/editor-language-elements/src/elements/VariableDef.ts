import { Element, ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import {
  isExpression,
  parseOneBlock,
  parseOneExpression,
} from '@decipad/language';
import { Node } from 'slate';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const VariableDef = {
  type: ELEMENT_VARIABLE_DEF,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (element: Element) => {
      if (element.type !== ELEMENT_VARIABLE_DEF) {
        throw new Error('element should be a variable def element');
      }
      if (element.children.length < 2) {
        return null;
      }
      const variableName = Node.string(element.children[0]);

      if (element.variant === 'expression') {
        const value = Node.string(element.children[1]);
        try {
          const block = parseOneBlock(value);
          if (block.args.length === 1 && isExpression(block.args[0])) {
            return { name: variableName, expression: block.args[0] };
          }
          // eslint-disable-next-line no-empty
        } catch {}
      } else if (element.variant === 'slider') {
        return {
          name: variableName,
          expression: parseOneExpression(element.children[1].value.toString()),
        };
      }

      return null;
    }
  ),
};
