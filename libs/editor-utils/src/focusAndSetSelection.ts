import { type MyEditor } from '@decipad/editor-types';
import { type Path } from 'slate';
import { getEndPoint, getNode, isVoid } from '@udecode/plate-common';
import { ReactEditor } from 'slate-react';
import { setSelection } from './setSelection';

export const focusAndSetSelection = (editor: MyEditor, path: Path) => {
  const node = getNode(editor, path);
  if (!node) {
    return;
  }
  if (isVoid(editor, node)) {
    return;
  }

  const point = getEndPoint(editor, path);

  ReactEditor.focus(editor as ReactEditor);
  setTimeout(() => setSelection(editor, { focus: point, anchor: point }), 0);
};
