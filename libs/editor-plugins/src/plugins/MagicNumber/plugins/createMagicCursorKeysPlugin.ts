import {
  getPointAfter,
  getPointBefore,
  hasNode,
  isCollapsed,
  isText,
  removeNodes,
  setSelection,
} from '@udecode/plate';
import { getNodeEntrySafe } from '@decipad/editor-utils';
import { createOnKeyDownPluginFactory } from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createMagicCursorKeysPlugin = createOnKeyDownPluginFactory({
  name: 'MAGIC_CURSOR_KEYS_PLUGIN',
  plugin: (editor) => (event) => {
    if (isCollapsed(editor.selection)) {
      if (event.key === 'ArrowLeft' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = getPointBefore(editor, focus);
          if (before && hasNode(editor, before.path)) {
            const beforeEntry = getNodeEntrySafe(editor, before.path);
            if (beforeEntry) {
              const [beforeNode, beforePath] = beforeEntry;
              if (isText(beforeNode) && isMagicNumber(beforeNode)) {
                // User is going into void element. Try to move the cursor past it
                const beforeBefore = getPointBefore(editor, beforePath);
                if (beforeBefore) {
                  setSelection(editor, {
                    focus: beforeBefore,
                    anchor: beforeBefore,
                  });
                  return true;
                }
              }
            }
          }
        }
      }

      if (event.key === 'Backspace') {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = getPointBefore(editor, focus);
          if (before && hasNode(editor, before.path)) {
            const beforeBefore = getPointBefore(editor, before);
            if (beforeBefore) {
              const beforeBeforeEntry = getNodeEntrySafe(
                editor,
                beforeBefore.path
              );
              if (beforeBeforeEntry) {
                const [beforeNode, beforePath] = beforeBeforeEntry;
                if (isText(beforeNode) && isMagicNumber(beforeNode)) {
                  removeNodes(editor, { at: beforePath });
                  return true;
                }
              }
            }
          }
        }
      }
    }

    if (event.key === 'Delete') {
      const focus = editor.selection?.focus;
      if (focus) {
        const after = getPointAfter(editor, focus);
        if (after && hasNode(editor, after.path)) {
          const afterEntry = getNodeEntrySafe(editor, after.path);
          if (afterEntry) {
            const [afterNode, afterPath] = afterEntry;
            if (isText(afterNode) && isMagicNumber(afterNode)) {
              removeNodes(editor, { at: afterPath });
              return true;
            }
            const afterAfter = getPointAfter(editor, after);
            if (afterAfter) {
              const afterAfterEntry = getNodeEntrySafe(editor, afterAfter.path);
              if (afterAfterEntry) {
                const [afterAfterNode, afterAfterPath] = afterAfterEntry;
                if (isText(afterAfterNode) && isMagicNumber(afterAfterNode)) {
                  removeNodes(editor, { at: afterAfterPath });
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  },
});
