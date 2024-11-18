import { EditorController } from './EditorController';

import { assert } from '@decipad/utils';
import { FIRST_TAB_INDEX } from './constants';

export const onDelete = (
  controller: EditorController,
  blockId: string
): void => {
  const entry = controller.getEntryFromId(blockId);
  assert(entry != null);

  const [node, path] = entry;

  controller.apply({
    type: 'remove_node',
    node,
    path,
  });
};

export const onMoveToTab = (
  controller: EditorController,
  blockId: string,
  tabId: string
): void => {
  const tabIndex = controller.getTabEditorIndex(tabId);
  const editor = controller.getTabEditorAt(tabIndex);

  const entry = controller.getEntryFromId(blockId);
  assert(entry != null);

  const [, path] = entry;

  controller.apply({
    type: 'move_node',
    path,
    newPath: [tabIndex + FIRST_TAB_INDEX, editor.children.length - 1],
  });
};
