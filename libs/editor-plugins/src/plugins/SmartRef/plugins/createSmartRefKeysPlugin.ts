import {
  getEndPoint,
  getNodeEntry,
  getParentNode,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  hasNode,
  isCollapsed,
  setSelection,
} from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../../pluginFactories';
import { isSmartRef } from '../utils/isSmartRef';

export const createSmartRefKeysPlugin = createOnKeyDownPluginFactory({
  name: 'SMART_REF_KEYS_PLUGIN',
  plugin: (editor) => (event) => {
    if (isCollapsed(editor.selection)) {
      if (event.key === 'Backspace' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = getPointBefore(editor, focus);
          if (before && hasNode(editor, before.path)) {
            const [, beforePath] = getNodeEntry(editor, before.path);
            const parentEntry = getParentNode(editor, beforePath);
            if (parentEntry) {
              const [parentNode, parentPath] = parentEntry;
              if (isSmartRef(parentNode)) {
                // User is backspacing into smart ref.
                // Select it instead of removing imemdiately
                const smartRefPoint = getStartPoint(editor, parentPath);
                setSelection(editor, {
                  focus: smartRefPoint,
                  anchor: smartRefPoint,
                });
                event.stopPropagation();
                event.preventDefault();
              }
            }
          }
        }
      } else if (event.key === 'Delete' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const after = getPointAfter(editor, focus);
          if (after && hasNode(editor, after.path)) {
            const [, afterPath] = getNodeEntry(editor, after.path);
            const parentEntry = getParentNode(editor, afterPath);
            if (parentEntry) {
              const [parentNode, parentPath] = parentEntry;
              if (isSmartRef(parentNode)) {
                // User is deleting into smart ref.
                // Select it instead of removing imemdiately
                const smartRefPoint = getEndPoint(editor, parentPath);
                setSelection(editor, {
                  focus: smartRefPoint,
                  anchor: smartRefPoint,
                });
                event.stopPropagation();
                event.preventDefault();
              }
            }
          }
        }
      }
    }
    return false;
  },
});
