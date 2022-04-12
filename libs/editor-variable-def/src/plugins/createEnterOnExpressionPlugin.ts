import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { Element, ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { Editor, Transforms } from 'slate';

export const createEnterOnExpressionPlugin = createOnKeyDownPluginFactory({
  name: 'ENTER_ON_EXPRESSION_PLUGIN',
  plugin: (editor) => (event) => {
    const loc = Editor.above(editor);
    if (loc) {
      const [node] = loc;
      if ((node as Element)?.type === ELEMENT_EXPRESSION) {
        if (event.code === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          const next = Editor.next(editor);
          if (next) {
            const [, path] = next;
            const anchor = { offset: 0, path };
            Transforms.setSelection(editor, { anchor, focus: anchor });
          }
          return false;
        }
      }
    }
    return true;
  },
});
