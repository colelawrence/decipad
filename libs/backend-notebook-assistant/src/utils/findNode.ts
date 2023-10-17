import { MyNode, RootDocument } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

export const findNode = (
  node: MyNode | RootDocument,
  match: (n: MyNode | RootDocument) => boolean
): MyNode | RootDocument | undefined => {
  if (match(node)) {
    return node;
  }
  if (isElement(node)) {
    for (const child of node.children) {
      const found = findNode(child, match);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};
