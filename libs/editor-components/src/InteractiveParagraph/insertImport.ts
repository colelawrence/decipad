import {
  ELEMENT_IMPORT,
  ImportElement,
  ImportElementSource,
  MyEditor,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import {
  insertNodes,
  isCollapsed,
  setSelection,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';

export const insertImport = (
  editor: MyEditor,
  source?: ImportElementSource,
  url?: string
) => {
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    const selBefore = selection;
    const fetchEl: ImportElement = {
      id: nanoid(),
      type: ELEMENT_IMPORT,
      url,
      source,
      children: [{ text: '' }],
    };
    withoutNormalizing(editor, () => {
      insertNodes(editor, fetchEl, {
        at: requirePathBelowBlock(editor, selection.anchor.path),
      });
      setSelection(editor, selBefore);
    });
  }
};
