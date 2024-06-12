import type { DragItemNode } from '@decipad/editor-components';

/**
 * Get the list of IDs of nodes that are being dragged. Ignore selectedIds
 * unless it includes the main dragged node.
 */
export const getDraggingIds = (item: DragItemNode): string[] => {
  if (item.selectedIds.has(item.id)) {
    return Array.from(item.selectedIds);
  }

  return [item.id];
};
