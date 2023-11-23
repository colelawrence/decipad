import { isElement } from '@udecode/plate-common';
import { getNodeString } from './getNodeString';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  type MyNode,
} from '@decipad/editor-types';

export const matchElementByVariableName =
  (variableName: string) => (node: MyNode) => {
    let varName: string | undefined;
    if (isElement(node) && 'type' in node) {
      if (
        node.type === ELEMENT_CODE_LINE_V2 ||
        node.type === ELEMENT_TABLE ||
        node.type === ELEMENT_VARIABLE_DEF
      ) {
        varName = getNodeString(node.children[0]);
      } else if (node.type === ELEMENT_CODE_LINE) {
        const code = getNodeString(node);
        varName = code.split('=')[0].trim();
      }
    }

    return variableName && varName === variableName;
  };
