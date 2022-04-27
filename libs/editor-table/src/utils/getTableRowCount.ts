import { Editor, Node, Path } from 'slate';

export const getTableRowCount = (editor: Editor, tablePath: Path): number => {
  return Array.from(Node.children(editor, tablePath)).length - 2;
};
