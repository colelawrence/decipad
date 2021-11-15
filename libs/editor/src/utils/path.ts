import { Editor, Path } from 'slate';

export const getBlockParentPath = (editor: Editor, path: Path): Path => {
  const currentBlockPath = Editor.isBlock(editor, Editor.node(editor, path)[0])
    ? path
    : Editor.above(editor, {
        at: path,
        match: (node) => Editor.isBlock(editor, node),
      })?.[1];

  if (!currentBlockPath) {
    throw new Error('Cannot find current block');
  }

  return currentBlockPath;
};

export const getPathBelowBlock = (editor: Editor, path: Path): Path => {
  return Path.next(getBlockParentPath(editor, path));
};
