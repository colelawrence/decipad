import {
  getEndPoint,
  getParentNode,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  hasNode,
  isCollapsed,
} from '@udecode/plate';
import { getNodeEntrySafe, setSelection } from '@decipad/editor-utils';
import { createOnKeyDownPluginFactory } from '../../../pluginFactories';
import { isSmartRef } from '../utils/isSmartRef';
import { MyEditor, MyValue } from '@decipad/editor-types';

export const createSmartRefKeysPlugin = createOnKeyDownPluginFactory<
  MyValue,
  MyEditor
>({
  name: 'SMART_REF_KEYS_PLUGIN',
  plugin: (editor) => (event) => {
    if (isCollapsed(editor.selection)) {
      if (event.key === 'Backspace' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const before = getPointBefore(editor, focus);
          if (before && hasNode(editor, before.path)) {
            const beforeEntry = getNodeEntrySafe(editor, before.path);
            if (beforeEntry) {
              const [, beforePath] = beforeEntry;
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
        }
      } else if (event.key === 'Delete' && !event.altKey && !event.ctrlKey) {
        const focus = editor.selection?.focus;
        if (focus) {
          const after = getPointAfter(editor, focus);
          if (after && hasNode(editor, after.path)) {
            const afterEntry = getNodeEntrySafe(editor, after.path);
            if (afterEntry) {
              const [, afterPath] = afterEntry;
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
    }
    return false;
  },
});
