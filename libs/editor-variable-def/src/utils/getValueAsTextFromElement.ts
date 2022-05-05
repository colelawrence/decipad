import { VariableDefinitionElement } from '@decipad/editor-types';
import { Node } from 'slate';

export const getValueAsTextFromElement = (
  element: VariableDefinitionElement
): string => {
  switch (element.variant) {
    case 'expression': {
      return Node.string(element.children[1]);
    }
    case 'slider': {
      return element.children[1].value.toString();
    }
  }
};
