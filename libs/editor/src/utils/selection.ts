import { isSelectionExpanded } from '@udecode/plate';
import { Editor, Path } from 'slate';

/**
 * Get the path of the current selection,
 * throwing if there is no selection or the selection is expanded.
 */
export const requireSelectionPath = (editor: Editor): Path => {
  if (!editor.selection) {
    throw new Error('There is no selection');
  }
  if (isSelectionExpanded(editor)) {
    throw new Error('The selection is expanded');
  }
  return editor.selection.anchor.path;
};
