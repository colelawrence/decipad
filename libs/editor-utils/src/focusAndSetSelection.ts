import { MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';
import { getEndPoint, setSelection } from '@udecode/plate';
import { ReactEditor } from 'slate-react';

export const focusAndSetSelection = (editor: MyEditor, path: Path) => {
  const point = getEndPoint(editor, path);

  ReactEditor.focus(editor as ReactEditor);
  setTimeout(() => setSelection(editor, { focus: point, anchor: point }), 0);
};
