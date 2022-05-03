import { isCollapsed, isText } from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import { createOnCursorChangePluginFactory } from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createMagicNumberCursorPlugin = createOnCursorChangePluginFactory(
  'MAGIC_NUMBER_CURSOR_PLUGIN',
  (editor) => (selection) => {
    if (isCollapsed(selection)) {
      const path = selection?.focus.path;
      if (path && Editor.hasPath(editor, path)) {
        const [node] = Editor.node(editor, path);
        if (isText(node) && isMagicNumber(node)) {
          const next = Editor.next(editor, { at: path });
          if (next) {
            const newFocus = Editor.start(editor, next[1]);
            newFocus.offset += 1; // skip to end character
            Transforms.setSelection(editor, {
              focus: newFocus,
              anchor: newFocus,
            });
          }
        }
      }
    }
  }
);
