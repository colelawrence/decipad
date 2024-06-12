import type { MyEditor } from '@decipad/editor-types';
import { COLUMN_KINDS } from '@decipad/editor-types';
import type { DragDropMonitor } from './types';
import type { DropTargetMonitor } from 'react-dnd';
import type { DragItemNode } from '@decipad/editor-components';
import { getDraggingIds } from './getDraggingIds';
import { getDropLines } from './getDropLines';
import { getNearestDropLine } from './getNearestDropLine';

export const getDropLineForMonitor = (
  editor: MyEditor,
  monitor: DragDropMonitor | DropTargetMonitor
) => {
  const item = monitor.getItem() as DragItemNode | null;
  // In case a different kind of item is being dragged
  if (!item || !('type' in item) || !('selectedIds' in item)) return null;

  // Prevent multiple selected nodes from being dragged into a column
  const allowColumns =
    COLUMN_KINDS.includes(item.type) && item.selectedIds.size <= 1;

  const draggingIds = getDraggingIds(item);
  const dropLines = getDropLines(editor, { allowColumns, draggingIds });

  const mousePosition = monitor.getClientOffset();
  if (!mousePosition) return null;

  return getNearestDropLine(dropLines, mousePosition);
};
