import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { ELEMENT_TD } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import type { TElement } from '@udecode/plate-common';
import { getBlockAbove, getNode } from '@udecode/plate-common';
import { nextCellPath } from '../utils/nextCellPath';

export const createArrowCellNavigationPlugin = createOnKeyDownPluginFactory({
  name: 'ARROW_CELL_NAVIGATION_PLUGIN',
  plugin: (editor) => (event) => {
    const edges: Record<string, 'top' | 'left' | 'bottom' | 'right'> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'top',
      ArrowDown: 'bottom',
    };

    const edge = edges[event.key];
    if (!edge) return false;

    /**
     * Shift: Move the focus relative to the focus and preserve the anchor
     * No shift: Move the focus and anchor relative to the anchor
     */
    const previousSelectionPoint = event.shiftKey
      ? editor.selection?.focus
      : editor.selection?.anchor;

    // Make sure the previous selection is in a cell
    const cellEntry = getBlockAbove(editor, {
      at: previousSelectionPoint,
      match: { type: ELEMENT_TD },
    });
    if (!cellEntry) return false;

    // Make sure the new selection will be in a cell
    const selectionPath = nextCellPath(cellEntry[1], edge);
    const selectionNode = getNode<TElement>(editor, selectionPath);

    if (selectionNode?.type !== ELEMENT_TD) {
      // Shift: Do nothing
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }

      // No shift: Use the default arrow key behaviour
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    const selectionPoint = { path: selectionPath.concat([0]), offset: 0 };

    setSelection(editor, {
      focus: selectionPoint,
      anchor: event.shiftKey ? undefined : selectionPoint,
    });

    return true;
  },
});
