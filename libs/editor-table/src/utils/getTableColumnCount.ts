import { Editor, Node, Path } from 'slate';

export const getTableColumnCount = (
  editor: Editor,
  tablePath: Path
): number | undefined => {
  const rowPath = [...tablePath, 1];
  if (Editor.hasPath(editor, rowPath)) {
    return Array.from(Node.children(editor, rowPath)).length;
  }
  return undefined;
};
