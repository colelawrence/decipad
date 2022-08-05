import {
  MyElement,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
} from '@decipad/editor-types';
import {
  isExpression,
  parseOneBlock,
  parseOneExpression,
} from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { NameAndExpressionInteractiveLanguageElement } from '../types';

export const VariableDef: NameAndExpressionInteractiveLanguageElement = {
  type: ELEMENT_VARIABLE_DEF,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor: MyEditor, element: MyElement) => {
      assertElementType(element, ELEMENT_VARIABLE_DEF);
      if (element.children.length < 2) {
        return [];
      }

      const { id } = element;
      const variableName = getNodeString(element.children[0]);

      if (element.variant === 'expression') {
        const value = getNodeString(element.children[1]);
        try {
          const block = parseOneBlock(value);
          if (block.args.length === 1 && isExpression(block.args[0])) {
            return [{ id, name: variableName, expression: block.args[0] }];
          }
          // eslint-disable-next-line no-empty
        } catch (err) {
          const parseErrors = [
            { error: (err as Error).message, elementId: element.id },
          ];
          return [{ id, name: variableName, parseErrors }];
        }
      } else if (element.variant === 'slider') {
        const expression = getNodeString(element.children[1]);
        try {
          return [
            {
              id,
              name: variableName,
              expression: parseOneExpression(expression),
            },
          ];
        } catch (err) {
          return [
            {
              id,
              name: variableName,
              parseErrors: [
                {
                  elementId: element.id,
                  error: (err as Error).message,
                },
              ],
            },
          ];
        }
      }

      return [];
    }
  ),
};
