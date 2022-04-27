import { Editor, Node, Path } from 'slate';

export const isTableColumnEmpty = (
  editor: Editor,
  tablePath: Path,
  columnIndex: number
): boolean => {
  let childIndex = -1;
  for (const [, rowPath] of Node.children(editor, tablePath)) {
    childIndex += 1;
    if (childIndex < 2) {
      continue;
    }
    const cellPath = [...rowPath, columnIndex];
    if (Editor.hasPath(editor, cellPath)) {
      const [cell] = Editor.node(editor, cellPath);
      if (Node.string(cell).length > 0) {
        return false;
      }
    }
  }
  return true;
};
