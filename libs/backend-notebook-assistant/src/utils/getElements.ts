import type { Document, AnyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

export const getElements = (
  content: Document | AnyElement,
  elementIds: Set<string>
): AnyElement[] => {
  let results: AnyElement[] = [];
  for (const child of content.children) {
    if (isElement(child)) {
      if (elementIds.has(child.id)) {
        elementIds.delete(child.id);
        results.push(child);
      } else {
        results = results.concat(getElements(child, elementIds));
      }
    }
  }
  return results;
};
