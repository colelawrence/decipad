import { Node, Path } from 'slate';
import { ReactEditor } from 'slate-react';

export const findPath = (editor: ReactEditor, node: Node): Path | undefined => {
  try {
    return ReactEditor.findPath(editor, node);
  } catch (err) {
    return undefined;
  }
};
