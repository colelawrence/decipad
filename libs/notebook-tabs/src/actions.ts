import { EditorController } from './EditorController';

import { assert } from '@decipad/utils';
import { FIRST_TAB_INDEX } from './constants';

export interface BlockActions {
  onDelete: (blockId: string) => void;
  onMoveToTab: (blockId: string, tabId: string) => void;
}

export const controllerActionsFactory = (
  controller: EditorController
): BlockActions => {
  const actions: BlockActions = {
    onDelete(blockId) {
      const entry = controller.getEntryFromId(blockId);
      assert(entry != null);

      const [node, path] = entry;

      controller.apply({
        type: 'remove_node',
        node,
        path,
      });
    },

    onMoveToTab(blockId, tabId) {
      const tabIndex = controller.getTabEditorIndex(tabId);
      const editor = controller.getTabEditorAt(tabIndex);

      const entry = controller.getEntryFromId(blockId);
      assert(entry != null);

      const [, path] = entry;

      controller.apply({
        type: 'move_node',
        path,
        newPath: [tabIndex + FIRST_TAB_INDEX, editor.children.length],
      });
    },
  };

  return actions;
};
