import { AnyElement, Document } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

export const findPath = (
  node: Document | AnyElement,
  blockId: string
): string[] | undefined => {
  let childIndex = -1;
  for (const child of node.children) {
    childIndex += 1;
    if (isElement(child)) {
      if (child.id === blockId) {
        return ['children', childIndex.toString()];
      }
      const path = findPath(child, blockId);
      if (path) {
        return ['children', childIndex.toString(), ...path];
      }
    }
  }
  return undefined;
};
