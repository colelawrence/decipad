import { ClipboardEvent } from 'react';
import {
  MyEditor,
  ELEMENT_CALLOUT,
  TopLevelValue,
} from '@decipad/editor-types';
import { getNode } from '@udecode/plate-common';

/**
 * Override default onPaste behaviour for editor, when components require special handling.
 */
export const editorOnPaste = (
  e: ClipboardEvent<HTMLDivElement>,
  editor: MyEditor
) => {
  if (!editor.selection) return;
  if (editor.selection.focus.path[0] !== editor.selection.anchor.path[0])
    return;

  const node = getNode<TopLevelValue>(editor, [
    editor.selection.anchor.path[0],
  ]);

  if (node && node.type === ELEMENT_CALLOUT) {
    const clipboard = e.clipboardData.getData('text/plain');
    editor.insertText(clipboard, { at: editor.selection.anchor });
    e.preventDefault();
  }
};
