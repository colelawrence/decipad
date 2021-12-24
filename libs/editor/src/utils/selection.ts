import { isSelectionExpanded } from '@udecode/plate';
import { Editor, Path, Point } from 'slate';

/**
 * Get the point of the current selection,
 * throwing if there is no selection or the selection is expanded.
 */
export const requireCollapsedSelection = (editor: Editor): Point => {
  if (!editor.selection) {
    throw new Error('There is no selection');
  }
  if (isSelectionExpanded(editor)) {
    throw new Error('The selection is expanded');
  }
  return editor.selection.anchor;
};

export const getPathContainingSelection = (editor: Editor): Path | null => {
  return editor.selection && Editor.node(editor, editor.selection)?.[1];
};
