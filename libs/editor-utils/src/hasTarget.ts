import { ReactEditor } from 'slate-react';
import { isDOMNode } from './isDOMNode';

export const hasTarget = (
  editor: ReactEditor,
  target: EventTarget | null
): target is Node => {
  return isDOMNode(target) && ReactEditor.hasDOMNode(editor, target);
};
