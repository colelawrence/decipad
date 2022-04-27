import { Editor, Node, Path } from 'slate';

export const isTableRowEmpty = (
  editor: Editor,
  tablePath: Path,
  rowIndex: number
): boolean => {
  const rowPath = [...tablePath, rowIndex + 2];
  for (const [td] of Node.children(editor, rowPath)) {
    if (Node.string(td).length > 0) {
      return false;
    }
  }
  return true;
};
