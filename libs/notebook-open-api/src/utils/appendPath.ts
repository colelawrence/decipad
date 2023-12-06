import { ELEMENT_PARAGRAPH, MyEditor } from '@decipad/editor-types';
import { getNodeString, isElement } from '@udecode/plate-common';

import type { Path } from 'slate';

export const appendPath = (editor: MyEditor): Path => {
  const last = editor.children[editor.children.length - 1];
  if (
    isElement(last) &&
    last.type === ELEMENT_PARAGRAPH &&
    getNodeString(last) === ''
  ) {
    // because we have a plugin that ensures a last element with an empty paragraph, we need to insert
    // before that so that we don't have empty paragraphs between elements.
    return [editor.children.length - 1];
  }
  return [editor.children.length];
};
