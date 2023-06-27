import { H1Element, MyEditor } from '@decipad/editor-types';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  insertNodes,
  nanoid,
  withoutNormalizing,
} from '@udecode/plate';

/**
 * Inserts the default nodes of a notebook.
 * DO NOT USE on a regular notebook, this is meant for clearing or creating
 * an entire notebook.
 */
export function createDefaultNotebook(editor: MyEditor) {
  withoutNormalizing(editor, () => {
    insertNodes<H1Element>(
      editor,
      {
        type: ELEMENT_H1,
        children: [{ text: 'My notebook' }],
        id: nanoid(),
      },
      { at: [0] }
    );
    insertNodes(
      editor,
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
        id: nanoid(),
      },
      { at: [1] }
    );
  });
}
