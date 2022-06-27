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
import { findNodePath, getNodeString } from '@udecode/plate';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { ParseError } from '../types';

export const VariableDef = {
  type: ELEMENT_VARIABLE_DEF,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (editor: MyEditor, element: MyElement) => {
      assertElementType(element, ELEMENT_VARIABLE_DEF);
      if (element.children.length < 2) {
        return null;
      }
      const parseErrors: ParseError[] = [];
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
          const path = findNodePath(editor, element);
          if (path) {
            parseErrors.push({
              error: (err as Error).message,
              elementId: element.id,
            });
          }
        }
      } else if (element.variant === 'slider') {
        const expression = getNodeString(element.children[1]);
        try {
          return {
            name: variableName,
            expression: parseOneExpression(expression),
            parseErrors,
          };
        } catch (err) {
          return {
            name: variableName,
            parseErrors: [
              {
                elementId: element.id,
                error: (err as Error).message,
              },
            ],
          };
        }
      }

      return null;
    }
  ),
};
