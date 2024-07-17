import { createOnCursorChangePluginFactory } from '@decipad/editor-plugin-factories';
import {
  blockSelectionActions,
  blockSelectionStore,
} from '@udecode/plate-selection';

function range(num1: number, num2: number) {
  const start = Math.min(num1, num2);
  const result = [];
  const end = Math.max(num1, num2);
  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }
  return result;
}

/**
 * When selecting text across multiple blocks, select the blocks themselves.
 */
export const createCrossBlockSelection = createOnCursorChangePluginFactory(
  'BLOCK_SELECTION_PLUGIN',
  (editor) => () => {
    const { selection } = editor;
    if (!selection) return;
    blockSelectionActions.unselect();
    if (selection.focus.path[0] !== selection.anchor.path[0]) {
      const blockRange = range(
        selection.focus.path[0],
        selection.anchor.path[0]
      );
      const ids: Set<string> = new Set();

      for (let i = blockRange[0]; i <= blockRange.at(-1)!; i += 1) {
        ids.add(editor.children[i].id ?? '');
      }
      blockSelectionStore.set.selectedIds(ids);
    }
  }
);
