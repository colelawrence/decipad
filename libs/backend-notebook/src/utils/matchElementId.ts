import { TNode, isElement } from '@udecode/plate';

export const matchElementId = (elementId: string) => (node: TNode) =>
  isElement(node) && node.id === elementId;
