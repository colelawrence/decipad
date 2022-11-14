import { MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';
import { getEndPoint, getNode, isVoid, setSelection } from '@udecode/plate';
import { ReactEditor } from 'slate-react';

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
