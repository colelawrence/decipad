import { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { isElement, isText, unwrapNodes } from '@udecode/plate';
import { normalizeExcessProperties } from './normalize';

export const normalizePlainTextChildren = (
  editor: MyEditor,
  children: Iterable<MyNodeEntry>
) => {
  for (const childEntry of children) {
    const [childNode, childPath] = childEntry;

    if (isElement(childNode)) {
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
