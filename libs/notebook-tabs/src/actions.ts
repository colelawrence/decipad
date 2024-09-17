import { EditorController } from './EditorController';
import { isElement } from '@udecode/plate-common';
import {
  DataTabValue,
  ELEMENT_LAYOUT,
  NotebookValue,
  TopLevelValue,
} from '@decipad/editor-types';
import { assert } from '@decipad/utils';
import { Path } from 'slate';
import { FIRST_TAB_INDEX } from './constants';

export interface BlockActions {
  onDelete: (blockId: string) => void;
  onMoveToTab: (blockId: string, tabId: string) => void;

  getEntryFromId: (
    blockId: string
  ) =>
    | [NotebookValue[number] | DataTabValue[number] | TopLevelValue, Path]
    | undefined;
}

export const controllerActionsFactory = (
  controller: EditorController
): BlockActions => {
  const getEntryFromId: BlockActions['getEntryFromId'] = (blockId) => {
    for (const [index, topLevel] of controller.children.entries()) {
      for (const [childIndex, child] of topLevel.children.entries()) {
        if (!isElement(child)) continue;

        if (child.type === ELEMENT_LAYOUT) {
          for (const [colIndex, layoutChild] of child.children.entries()) {
            if (layoutChild.id === blockId) {
              return [layoutChild, [index, childIndex, colIndex]];
            }
          }
        }

        if (child.id === blockId) {
          return [child, [index, childIndex]];
        }
      }
    }

    return undefined;
  };

  const actions: BlockActions = {
    getEntryFromId,

    onDelete(blockId) {
      const entry = getEntryFromId(blockId);
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

      const entry = getEntryFromId(blockId);
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
