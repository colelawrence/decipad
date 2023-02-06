import { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import {
  getNodeString,
  unwrapNodes,
  isElement,
  isText,
  removeNodes,
} from '@udecode/plate';
import { normalizeExcessProperties } from './normalize';

export const normalizePlainTextChildren = (
  editor: MyEditor,
  children: Iterable<MyNodeEntry>
) => {
  for (const childEntry of children) {
    const [childNode, childPath] = childEntry;

    if (isElement(childNode)) {
      const str = getNodeString(childNode);
      if (str === '') {
        // unwrapNodes does nothing if the element is empty
        removeNodes(editor, { at: childPath });
        return true;
      }

      unwrapNodes(editor, { at: childPath });
      return true;
    }

    if (isText(childNode)) {
      if (normalizeExcessProperties(editor, childEntry)) {
        return true;
      }
    }
  }

  return false;
};
