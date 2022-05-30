import { MyElement, ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import {
  isExpression,
  parseOneBlock,
  parseOneExpression,
} from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const VariableDef = {
  type: ELEMENT_VARIABLE_DEF,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (element: MyElement) => {
      assertElementType(element, ELEMENT_VARIABLE_DEF);
      if (element.children.length < 2) {
        return null;
      }
      const variableName = getNodeString(element.children[0]);

      if (element.variant === 'expression') {
        const value = getNodeString(element.children[1]);
        try {
          const block = parseOneBlock(value);
          if (block.args.length === 1 && isExpression(block.args[0])) {
            return { name: variableName, expression: block.args[0] };
          }
          // eslint-disable-next-line no-empty
        } catch (err) {
          console.error(err);
        }
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
