import type { MyElement } from '@decipad/editor-types';
import type { TNode } from '@udecode/plate-common';
import { isElement } from '@udecode/plate-common';

export const matchNodeType = (type: MyElement['type']) => (node: TNode) =>
  isElement(node) && node.type === type;
