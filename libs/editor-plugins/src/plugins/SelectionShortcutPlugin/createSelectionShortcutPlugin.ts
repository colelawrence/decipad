import type { Value } from '@udecode/plate-common';
import {
  getEndPoint,
  getNodeEntry,
  getStartPoint,
  isCollapsed,
  isText,
} from '@udecode/plate-common';
import type { BaseEditor, BaseSelection } from 'slate';
import { Transforms } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import {
  blockSelectionStore,
  blockSelectionSelectors,
  copySelectedBlocks,
} from '@udecode/plate-selection';
import type { MyGenericEditor } from '@decipad/editor-types';
import assert from 'assert';
import { dequal } from '@decipad/utils';

/**
 * Uses the `blockSelectionStore` used by Plate to select all blocks,
 * but not editor selection, a different selection where the blocks become
 * highlighted.
 */
function selectAll(editor: MyGenericEditor<Value>): void {
  const ids = editor.children.map((n) => n.id);
  blockSelectionStore.set.selectedIds(new Set(ids));
}

function selectBetweenRange(
  editor: MyGenericEditor<Value>,
  [start, end]: [number, number]
): void {
  const ids = editor.children
    .filter((_, i) => i >= start && i <= end)
    .map((n) => n.id);

  blockSelectionStore.set.selectedIds(new Set(ids));
}

function getBlockRange(
  selection: NonNullable<BaseSelection>
): [number, number] {
  return [
    Math.min(selection.anchor.path[0], selection.focus.path[0]),
    Math.max(selection.anchor.path[0], selection.focus.path[0]),
  ];
}

//
// What should happen when the user presses Ctrl+A?
//
// 1) No selection? This can happen when you are selecting a single block (blockSelectionStore).
// Or arent focused on the editor. We select all blocks.
//
// 2) Is selection in a node? and is it not selecting the whole node? Select the text.
//
// 3) If the selection isn't collapsed we select the blocks that the range is over.
//

export const createSelectionShortcutPlugin = createOnKeyDownPluginFactory({
  name: 'SELECTION_SHORTCUT_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;

    // handle copying when all blocks have been selected with ctrl + a
    const blocksSelected = blockSelectionSelectors.selectedIds().size > 0;
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === 'c' &&
      blocksSelected
    ) {
      event.preventDefault();
      event.stopPropagation();
      copySelectedBlocks(editor);
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
      event.preventDefault();

      if (!selection) {
        // The cursor is not on any node inside the editor, select everything.
        selectAll(editor);
        return;
      }

      assert(selection);

      const wholeBlockSelection: BaseSelection = {
        anchor: getStartPoint(editor, [selection.anchor.path[0]]),
        focus: getEndPoint(editor, [selection.anchor.path[0]]),
      };

      if (isCollapsed(selection) && !dequal(wholeBlockSelection, selection)) {
        const entry = getNodeEntry(editor, selection.anchor.path);
        assert(entry != null, 'Node must be defined under selection');

        const [node] = entry;
        const path = [...selection.anchor.path];
        if (isText(node)) {
          path.pop();
        }

        Transforms.select(editor as BaseEditor, path);
        return;
      }

      const range = getBlockRange(selection);
      editor.deselect();
      selectBetweenRange(editor, range);
    }
  },
});
