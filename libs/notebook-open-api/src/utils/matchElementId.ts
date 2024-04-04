import type { TNode } from '@udecode/plate-common';
import { isElement } from '@udecode/plate-common';

export const matchElementId = (elementId: string) => (node: TNode) =>
  isElement(node) && node.id === elementId;
