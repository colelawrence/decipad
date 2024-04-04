import type { MyNode, CodeLineElement } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';

export const isCodeLine = (node: MyNode): node is CodeLineElement => {
  return isElement(node) && node.type === ELEMENT_CODE_LINE;
};
