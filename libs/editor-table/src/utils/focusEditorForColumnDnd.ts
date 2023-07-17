import { MyEditor } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import { focusEditor, getStartPoint, hasNode } from '@udecode/plate';
import { Path } from 'slate';

export const focusEditorForColumnDnd = (
  editor: MyEditor,
  tablePath: Path | undefined,
  columns: [number, number]
) => {
  focusEditor(editor);

  if (!tablePath) return;

  const thPath = [...tablePath, 1, columns[1]];
  if (hasNode(editor, thPath)) {
    const newFocus = getStartPoint(editor, thPath);
    setSelection(editor, {
      focus: newFocus,
      anchor: newFocus,
    });
  }
};
