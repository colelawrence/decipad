import type { MyNode, SmartRefElement } from '@decipad/editor-types';
import { ELEMENT_SMART_REF } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';

export const isSmartRef = (node: MyNode): node is SmartRefElement => {
  return isElement(node) && node.type === ELEMENT_SMART_REF;
};
