import { nanoid } from 'nanoid';
import { H1Element, MyEditor, ParagraphElement } from '@decipad/editor-types';
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate';

export function ensureInitialDocument(editor: MyEditor): void {
  const { children } = editor;
  if (children.length > 1) {
    return;
  }
  if (children.length === 0) {
    withoutNormalizing(editor, () => {
      insertNodes<H1Element>(
        editor,
        {
          type: ELEMENT_H1,
          children: [{ text: 'My notebook title' }],
          id: nanoid(),
        },
        { at: [0] }
      );
      insertNodes<ParagraphElement>(
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
}
