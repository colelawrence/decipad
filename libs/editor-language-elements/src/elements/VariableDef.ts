import {
  MyElement,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { assertElementType } from '@decipad/editor-utils';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { inferType } from '../utils/inferType';
import { InteractiveLanguageElement } from '../types';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';

export const VariableDef: InteractiveLanguageElement = {
  type: ELEMENT_VARIABLE_DEF,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor: MyEditor, _computer: Computer, element: MyElement) => {
      assertElementType(element, ELEMENT_VARIABLE_DEF);

      if (element.children.length < 2) {
        return [];
      }

      const { id, children } = element;
      const variableName = getNodeString(children[0]);
      let expression = getNodeString(children[1]);

      if (element.variant === 'expression') {
        const type = inferType(expression, element.coerceToType);
        expression = type.coerced;
      }

      return [parseElementVariableAssignment(id, variableName, expression)];
    }
  ),
};
