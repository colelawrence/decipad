import { Editor, Path } from 'slate';

export const getBlockParentPath = (editor: Editor, path: Path): Path | null => {
  const currentBlockPath = Editor.isBlock(editor, Editor.node(editor, path)[0])
    ? path
    : Editor.above(editor, {
        at: path,
        match: (node) => Editor.isBlock(editor, node),
      })?.[1];

  return currentBlockPath ?? null;
};
export const requireBlockParentPath = (editor: Editor, path: Path): Path => {
  const blockParentPath = getBlockParentPath(editor, path);
  if (!blockParentPath) {
    throw new Error('Cannot find block parent');
  }
  return blockParentPath;
};

export const requirePathBelowBlock = (editor: Editor, path: Path): Path => {
  return Path.next(requireBlockParentPath(editor, path));
};
