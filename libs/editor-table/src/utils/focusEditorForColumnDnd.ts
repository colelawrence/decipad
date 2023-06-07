import { MyEditor, MyElement } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import {
  findNodePath,
  focusEditor,
  getStartPoint,
  hasNode,
} from '@udecode/plate';

export const focusEditorForColumnDnd = (
  editor: MyEditor,
  table: MyElement,
  columns: [number, number]
) => {
  focusEditor(editor);

  const tablePath = findNodePath(editor, table);
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
