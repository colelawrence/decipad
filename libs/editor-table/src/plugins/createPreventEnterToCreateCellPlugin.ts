import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { BlockElement, ELEMENT_TD, ELEMENT_TH } from '@decipad/editor-types';
import { getBlockAbove, getPointAfter, select } from '@udecode/plate';

export const createPreventEnterToCreateCellPlugin =
  createOnKeyDownPluginFactory({
    name: 'PREVENT_ENTER_TO_CREATE_CELL_PLUGIN',
    plugin: (editor) => (event) => {
      if (event.code === 'Enter') {
        const entry = getBlockAbove<BlockElement>(editor);
        if (!entry) return false;
        const [node, path] = entry;
        if (node.type === ELEMENT_TD || node.type === ELEMENT_TH) {
          const after = getPointAfter(editor, path);
          if (after) {
            select(editor, after);
          }
          event.stopPropagation();
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
  });
