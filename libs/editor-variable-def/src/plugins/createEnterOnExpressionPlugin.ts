import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { MyElement, ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { getAboveNode, getNextNode, setSelection } from '@udecode/plate';

export const createEnterOnExpressionPlugin = createOnKeyDownPluginFactory({
  name: 'ENTER_ON_EXPRESSION_PLUGIN',
  plugin:
    (editor) =>
    (event): boolean | void => {
      const loc = getAboveNode(editor);
      if (loc) {
        const [node] = loc;
        if (
          (node as MyElement)?.type === ELEMENT_EXPRESSION &&
          event.code === 'Enter'
        ) {
          const next = getNextNode(editor);
          if (next) {
            event.preventDefault();
            event.stopPropagation();
            const [, path] = next;
            const anchor = { offset: 0, path };
            setSelection(editor, { anchor, focus: anchor });
          }
        }
      }
    },
});
