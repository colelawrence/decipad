import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { BlockElement, ELEMENT_TD, ELEMENT_TH } from '@decipad/editor-types';
import { getBlockAbove, TEditor } from '@udecode/plate';
import { Editor, NodeEntry, Transforms } from 'slate';

export const createPreventEnterToCreateCellPlugin =
  createOnKeyDownPluginFactory({
    name: 'PREVENT_ENTER_TO_CREATE_CELL_PLUGIN',
    plugin: (editor: TEditor) => (event) => {
      if (event.code === 'Enter') {
        const entry = getBlockAbove(editor);
        if (!entry) return false;
        const [node, path] = entry as NodeEntry<BlockElement>;
        if (node.type === ELEMENT_TD || node.type === ELEMENT_TH) {
          const after = Editor.after(editor, path);
          if (after) {
            Transforms.select(editor, after);
          }
          event.stopPropagation();
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
  });
