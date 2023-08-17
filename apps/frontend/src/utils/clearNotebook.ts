import { MyEditor } from '@decipad/editor-types';
import { createDefaultNotebook } from '@decipad/editor-utils';
import { removeNodes, withoutNormalizing } from '@udecode/plate';

export function clearNotebook(editor: MyEditor) {
  withoutNormalizing(editor, () => {
    editor.children.forEach((_i) => {
      removeNodes(editor, {
        at: [0],
      });
    });
    createDefaultNotebook(editor);
  });
}
