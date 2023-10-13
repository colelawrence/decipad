import { type TNode, isElement } from '@udecode/plate';
import { RootDocument } from '@decipad/editor-types';

const scanNodeElementIds = (
  node: TNode,
  existingIds: Set<string>
): Set<string> => {
  if (isElement(node)) {
    if (typeof node.id === 'string') {
      existingIds.add(node.id);
    }
    for (const child of node.children) {
      scanNodeElementIds(child, existingIds);
    }
  }
  return existingIds;
};

export const scanElementIds = (doc: RootDocument): Set<string> => {
  const elementIds = new Set<string>();
  for (const child of doc.children) {
    scanNodeElementIds(child, elementIds);
  }
  return elementIds;
};
