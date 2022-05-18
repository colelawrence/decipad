import { getNodeEntry, isSelectionExpanded, TEditor } from '@udecode/plate';
import { Path, Point } from 'slate';

/**
 * Get the point of the current selection,
 * throwing if there is no selection or the selection is expanded.
 */
export const requireCollapsedSelection = (editor: TEditor): Point => {
  if (!editor.selection) {
    throw new Error('There is no selection');
  }
  if (isSelectionExpanded(editor)) {
    throw new Error('The selection is expanded');
  }
  return editor.selection.anchor;
};

export const getCollapsedSelection = (editor: TEditor): Point | null => {
  if (!editor.selection || isSelectionExpanded(editor)) {
    return null;
  }
  return editor.selection.anchor;
};

export const getPathContainingSelection = (editor: TEditor): Path | null => {
  return editor.selection && getNodeEntry(editor, editor.selection)?.[1];
};
