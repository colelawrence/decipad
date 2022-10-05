import {
  ELEMENT_SMART_REF,
  MyNode,
  SmartRefElement,
} from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

export const isSmartRef = (node: MyNode): node is SmartRefElement => {
  return isElement(node) && node.type === ELEMENT_SMART_REF;
};
