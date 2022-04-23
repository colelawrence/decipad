import { Editor, Path, Transforms } from 'slate';

export const safeDelete = (editor: Editor, path: Path): boolean => {
  if (Editor.hasPath(editor, path)) {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: path });
    });
    return true;
  }
  return false;
};
