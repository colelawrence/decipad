import { Editor, Node, Path } from 'slate';

export const getColumnNames = (editor: Editor, path: Path): Set<string> => {
  const headerRowPath = [...path, 1];
  return new Set(
    Array.from(Node.children(editor, headerRowPath)).map((th) =>
      Node.string(th[0])
    )
  );
};
