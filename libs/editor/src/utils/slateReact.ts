import { Path } from 'slate';
import { ReactEditor } from 'slate-react';

export const findDomNodePath = (editor: ReactEditor, node: Node): Path =>
  ReactEditor.findPath(editor, ReactEditor.toSlateNode(editor, node));
