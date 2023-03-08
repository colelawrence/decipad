import {
  ELEMENT_CODE_LINE,
  MyNode,
  CodeLineElement,
} from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

export const isCodeLine = (node: MyNode): node is CodeLineElement => {
  return isElement(node) && node.type === ELEMENT_CODE_LINE;
};
