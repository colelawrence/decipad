import type { MyElement } from '@decipad/editor-types';
import { isElement, TNode } from '@udecode/plate-common';

export const matchNodeType = (type: MyElement['type']) => (node: TNode) =>
  isElement(node) && node.type === type;
