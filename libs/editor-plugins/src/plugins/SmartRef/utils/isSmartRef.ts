import type { SmartRefElement } from '@decipad/editor-types';
import { ELEMENT_SMART_REF } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';

export const isSmartRef = (node: unknown): node is SmartRefElement => {
  return isElement(node) && node.type === ELEMENT_SMART_REF;
};
