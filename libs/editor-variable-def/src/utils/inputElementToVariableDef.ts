import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
  DeprecatedInputElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';

export const inputElementToVariableDef = (
  inputElement: DeprecatedInputElement
): VariableDefinitionElement => {
  return {
    id: inputElement.id,
    type: ELEMENT_VARIABLE_DEF,
    variant: 'expression',
    children: [
      {
        id: nanoid(),
        type: ELEMENT_CAPTION,
        children: [{ text: inputElement.variableName || '' }],
        icon: inputElement.icon,
        color: inputElement.color,
      },
      {
        id: nanoid(),
        type: ELEMENT_EXPRESSION,
        children: [{ text: inputElement.value || '' }],
      },
    ],
  };
};
