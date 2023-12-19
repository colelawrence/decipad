import { Value, getEndPoint, getStartPoint } from '@udecode/plate-common';
import { BaseEditor, BaseSelection, Transforms } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { blockSelectionStore } from '@udecode/plate-selection';
import { MyGenericEditor } from '@decipad/editor-types';
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

function isSelectionSameBlock(selection: BaseSelection): boolean {
  if (!selection) return false;
  return selection.anchor.path[0] === selection.focus.path[0];
}

//
// What should happen when the user presses Ctrl+A?
//
// 1) If selection is in same block
// 1.1) If it doesn't span the entire block (only partially selected), we select whole block.
// 1.2) Otherwise we select ALL blocks using `blockSelectionStore` and deselect the editor.
// 2) Everything else, we deselect the editor and select ALL blocks using `blockSelectionStore`.
//

export const createSelectionShortcutPlugin = createOnKeyDownPluginFactory({
  name: 'SELECTION_SHORTCUT_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;

    if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
      event.preventDefault();

      if (isSelectionSameBlock(selection)) {
        assert(selection);

        const wholeBlockSelection: BaseSelection = {
          anchor: getStartPoint(editor, [selection.anchor.path[0]]),
          focus: getEndPoint(editor, [selection.anchor.path[0]]),
        };

        if (dequal(wholeBlockSelection, selection)) {
          editor.deselect();
          selectAll(editor);
          return;
        }

        editor.setSelection(wholeBlockSelection);
        return;
      }

      if (!selection) {
        // The cursor is not on any node inside the editor, select everything.
        selectAll(editor);
        return;
      }

      // Otherwise, lets fully select the current block.
      Transforms.select(editor as BaseEditor, selection.anchor.path);
    }
  },
});
