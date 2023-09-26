import { AnyElement, Text } from '@decipad/editor-types';
import { getNodeString, isElement } from '@udecode/plate';
import { ELEMENT_SMART_REF } from '../../../editor-types/src/element-kinds';

export const getCodeNoteString = (node: AnyElement | Text): string => {
  if (isElement(node)) {
    if (node.type === ELEMENT_SMART_REF) {
      return node.lastSeenVariableName ?? getNodeString(node);
    }
    return node.children.map(getCodeNoteString).join('');
  }
  return getNodeString(node);
};
