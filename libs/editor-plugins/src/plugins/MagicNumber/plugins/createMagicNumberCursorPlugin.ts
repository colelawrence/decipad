import {
  getNextNode,
  getStartPoint,
  hasNode,
  isCollapsed,
  isText,
  setSelection,
} from '@udecode/plate';
import { getNodeEntrySafe } from '@decipad/editor-utils';
import { createOnCursorChangePluginFactory } from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createMagicNumberCursorPlugin = createOnCursorChangePluginFactory(
  'MAGIC_NUMBER_CURSOR_PLUGIN',
  (editor) => (selection) => {
    if (isCollapsed(selection)) {
      const path = selection?.focus.path;
      if (path && hasNode(editor, path)) {
        const entry = getNodeEntrySafe(editor, path);
        if (entry) {
          const [node] = entry;

          if (isText(node) && isMagicNumber(node)) {
            const next = getNextNode(editor, { at: path });
            if (next) {
              const newFocus = getStartPoint(editor, next[1]);
              newFocus.offset += 1; // skip to end character
              setSelection(editor, {
                focus: newFocus,
                anchor: newFocus,
              });
            }
          }
        }
      }
    }
  }
);
