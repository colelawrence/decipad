import { MyEditor } from '@decipad/editor-types';
import { focusEditor, getEndPoint, isCollapsed } from '@udecode/plate';
import { Path } from 'slate';

export const afterTableMenuInteraction = (
  editor: MyEditor,
  tablePath: Path,
  columnIndex?: number
) => {
  if (
    isCollapsed(editor.selection) &&
    (!editor.selection?.focus.path ||
      !Path.isChild(tablePath, editor.selection.focus.path))
  ) {
    const selPath = [...tablePath, 1];
    if (columnIndex != null) {
      selPath.push(columnIndex);
    }
    try {
      const selPoint = getEndPoint(editor, selPath);
      focusEditor(editor, selPoint);
    } catch (err) {
      // do nothing
    }
  }
};
