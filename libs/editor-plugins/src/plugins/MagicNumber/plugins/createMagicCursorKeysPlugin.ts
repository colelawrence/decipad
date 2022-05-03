import { isCollapsed, isText } from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import { createOnKeyDownPluginFactory } from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createMagicCursorKeysPlugin = createOnKeyDownPluginFactory({
  name: 'MAGIC_CURSOR_KEYS_PLUGIN',
  plugin: (editor) => (event) => {
    if (isCollapsed(editor.selection)) {
      if (event.key === 'ArrowLeft' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = Editor.before(editor, focus);
          if (before && Editor.hasPath(editor, before.path)) {
            const [beforeNode, beforePath] = Editor.node(editor, before.path);
            if (isText(beforeNode) && isMagicNumber(beforeNode)) {
              // User is going into void element. Try to move the cursor past it
              const beforeBefore = Editor.before(editor, beforePath);
              if (beforeBefore) {
                Transforms.setSelection(editor, {
                  focus: beforeBefore,
                  anchor: beforeBefore,
                });
                return true;
              }
            }
          }
        }
      }

      if (event.key === 'Backspace') {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = Editor.before(editor, focus);
          if (before && Editor.hasPath(editor, before.path)) {
            const beforeBefore = Editor.before(editor, before);
            if (beforeBefore) {
              const [beforeNode, beforePath] = Editor.node(
                editor,
                beforeBefore.path
              );
              if (isText(beforeNode) && isMagicNumber(beforeNode)) {
                Transforms.removeNodes(editor, { at: beforePath });
                return true;
              }
            }
          }
        }
      }
    }

    if (event.key === 'Delete') {
      const focus = editor.selection?.focus;
      if (focus) {
        const after = Editor.after(editor, focus);
        if (after && Editor.hasPath(editor, after.path)) {
          const [afterNode, afterPath] = Editor.node(editor, after.path);
          if (isText(afterNode) && isMagicNumber(afterNode)) {
            Transforms.removeNodes(editor, { at: afterPath });
            return true;
          }
          const afterAfter = Editor.after(editor, after);
          if (afterAfter) {
            const [afterAfterNode, afterAfterPath] = Editor.node(
              editor,
              afterAfter.path
            );
            if (isText(afterAfterNode) && isMagicNumber(afterAfterNode)) {
              Transforms.removeNodes(editor, { at: afterAfterPath });
              return true;
            }
          }
        }
      }
    }
    return false;
  },
});
