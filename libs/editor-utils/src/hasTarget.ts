import { hasEditorDOMNode } from '@udecode/plate';
import { MyReactEditor } from '@decipad/editor-types';
import { isDOMNode } from './isDOMNode';

export const hasTarget = (
  editor: MyReactEditor,
  target: EventTarget | null
): target is Node => {
  return isDOMNode(target) && hasEditorDOMNode(editor, target);
};
