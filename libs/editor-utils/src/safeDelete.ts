import { Path } from 'slate';
import { hasNode, removeNodes, withoutNormalizing } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

export const safeDelete = (editor: MyEditor, path: Path): boolean => {
  if (hasNode(editor, path)) {
    withoutNormalizing(editor, () => {
      removeNodes(editor, { at: path });
    });
    return true;
  }
  return false;
};
