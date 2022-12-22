import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  MyElement,
  ELEMENT_EXPRESSION,
  ELEMENT_CAPTION,
} from '@decipad/editor-types';
import {
  getNextNode,
  getNodeString,
  getParentNode,
  isSelectionExpanded,
  setSelection,
} from '@udecode/plate';

export const createEnterOnExpressionPlugin = createOnKeyDownPluginFactory({
  name: 'ENTER_ON_EXPRESSION_PLUGIN',
  plugin:
    (editor) =>
    (event): boolean | void => {
      const { selection } = editor;
      if (!selection) return false;

      const parentNode = getParentNode(editor, selection?.anchor.path);
      if (!parentNode) return false;

      const [node] = parentNode;

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
      } else if (
        (node as MyElement)?.type === ELEMENT_CAPTION &&
        event.code === 'Enter'
      ) {
        const title = getNodeString(node);
        // If the user is at the end of the title
        // And also their selection is collapsed (Anchor and Focus are the same).
        if (
          isSelectionExpanded(editor) ||
          title.length !== editor.selection?.anchor.offset
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
});
