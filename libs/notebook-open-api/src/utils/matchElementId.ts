import { isElement, TNode } from '@udecode/plate-common';

export const matchElementId = (elementId: string) => (node: TNode) =>
  isElement(node) && node.id === elementId;
