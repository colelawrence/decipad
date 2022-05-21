import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  BlockElement,
  ELEMENT_TABLE_VARIABLE_NAME,
} from '@decipad/editor-types';
import { getBlockAbove, getEndPoint } from '@udecode/plate';
import { Point } from 'slate';

export const createPreventDeleteTableFromCaptionPlugin =
  createOnKeyDownPluginFactory({
    name: 'CREATE_PREVENT_DELETE_TABLE_FROM_CAPTION_PLUGIN',
    plugin: (editor) => (event) => {
      if (event.code === 'Delete') {
        const entry = getBlockAbove<BlockElement>(editor);
        if (!entry) return false;
        const [node, path] = entry;
        if (node.type === ELEMENT_TABLE_VARIABLE_NAME) {
          if (editor.selection?.focus) {
            const endPoint = getEndPoint(editor, path);
            if (Point.equals(editor.selection.focus, endPoint)) {
              event.stopPropagation();
              event.preventDefault();
              return true;
            }
          }
        }
      }
      return false;
    },
  });
