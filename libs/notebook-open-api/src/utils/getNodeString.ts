import { ELEMENT_SMART_REF } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import {
  type TNode,
  isElement,
  getNodeString as rootGetNodeString,
} from '@udecode/plate';

export const getNodeString = (node: TNode): string => {
  if (!isElement(node)) {
    return rootGetNodeString(node);
  }
  if (isElementOfType(node, ELEMENT_SMART_REF)) {
    return node.lastSeenVariableName ?? rootGetNodeString(node);
  }
  return node.children.map(getNodeString).join('');
};
