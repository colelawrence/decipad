import {
  MyElement,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
} from '@decipad/editor-types';
import { AST, Computer, getExprRef } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { assertElementType } from '@decipad/editor-utils';
import { inferType } from '@decipad/parse';
import { getDefined } from '@decipad/utils';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const VariableDef: InteractiveLanguageElement = {
  type: ELEMENT_VARIABLE_DEF,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor: MyEditor, computer: Computer, element: MyElement) => {
      assertElementType(element, ELEMENT_VARIABLE_DEF);

      if (element.children.length < 2) {
        return [];
      }

      const { id, children } = element;
      const variableName = getNodeString(children[0]);
      let expression: string | AST.Expression = getNodeString(children[1]);

      if (
        element.variant === 'expression' ||
        element.variant === 'date' ||
        element.variant === 'toggle' ||
        element.variant === 'dropdown'
      ) {
        const { type, coerced } = await inferType(computer, expression, {
          type: element.coerceToType,
        });
        if (type.kind === 'anything' || type.kind === 'nothing') {
          expression = {
            type: 'noop',
            args: [],
          };
        } else {
          expression = getDefined(coerced);
        }
        if (element.variant === 'dropdown') {
          const dropdownVariable = parseElementAsVariableAssignment(
            id,
            variableName,
            expression
          );
          // TODO: Refactor this part into function.
          const dropdownOptions = (
            await Promise.all(
              element.children[1].options.map(async (option) => {
                let dropdownExpression: string | AST.Expression;
                const dropdownType = await inferType(computer, option.value, {
                  type: element.coerceToType,
                });
                if (
                  dropdownType.type.kind === 'anything' ||
                  dropdownType.type.kind === 'nothing'
                ) {
                  dropdownExpression = {
                    type: 'noop',
                    args: [],
                  };
                } else {
                  dropdownExpression = getDefined(dropdownType.coerced);
                }
                return parseElementAsVariableAssignment(
                  option.id,
                  getExprRef(option.id),
                  dropdownExpression
                );
              })
            )
          ).flat();
          return [...dropdownVariable, ...dropdownOptions];
        }
      }

      return parseElementAsVariableAssignment(id, variableName, expression);
    }
  ),
};
