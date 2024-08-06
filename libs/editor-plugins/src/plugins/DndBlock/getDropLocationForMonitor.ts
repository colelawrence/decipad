import { ELEMENT_LAYOUT, type MyEditor } from '@decipad/editor-types';
import { findElementById, isColumnableKind } from '@decipad/editor-utils';
import type { DragDropMonitor } from './types';
import type { DropTargetMonitor } from 'react-dnd';
import type { DragItemNode } from '@decipad/editor-components';
import { getDraggingIds } from './getDraggingIds';
import { getDropLocations } from './getDropLocations';
import { getNearestDropLocation } from './getNearestDropLocation';

export const getDropLocationForMonitor = (
  editor: MyEditor,
  monitor: DragDropMonitor | DropTargetMonitor
) => {
  const item = monitor.getItem() as DragItemNode | null;
  // In case a different kind of item is being dragged
  if (!item || !('type' in item) || !('selectedIds' in item)) return null;

  const nodeEntry = findElementById(editor, item.id);
  if (!nodeEntry) return null;
  const [node, path] = nodeEntry;

  const isColumnable = isColumnableKind(node.type);
  const draggingIds = getDraggingIds(item);

  // Prevent multiple selected nodes from being dragged into a column
  const allowColumns = isColumnable && draggingIds.length === 1;

  /**
   * Columnable blocks can be dropped onto their own margin to wrap them in a
   * new full-width layout. Layouts that aren't already full-width can be
   * dropped onto their own margin to make them full-width.
   */
  const isTopLevel = path.length === 1;
  const isNonFullWidthLayout =
    node.type === ELEMENT_LAYOUT && node.width !== 'full';
  const allowDragOntoOwnMargin =
    isTopLevel && (isColumnable || isNonFullWidthLayout);

  const dropLocations = getDropLocations(editor, {
    allowColumns,
    allowDragOntoOwnMargin,
    draggingIds,
  });

  const mousePosition = monitor.getClientOffset();
  if (!mousePosition) return null;

  return getNearestDropLocation(dropLocations, mousePosition);
};
