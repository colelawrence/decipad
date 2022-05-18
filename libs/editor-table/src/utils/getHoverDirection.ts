import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { DropTargetMonitor } from 'react-dnd';
import { toDOMNode } from '@udecode/plate';
import { ColumnDndDirection } from '../types';

/**
 * If dragging a block A over another block B:
 * get the direction of block A relative to block B.
 */
export const getHoverDirection = (
  editor: MyReactEditor,
  monitor: DropTargetMonitor,
  element: MyElement
): ColumnDndDirection => {
  const node = toDOMNode(editor, element);
  if (!node) return;

  // Determine rectangle on screen
  const hoverBoundingRect = node.getBoundingClientRect();

  // Get middle
  const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;

  const hoverClientX = clientOffset.x - hoverBoundingRect.left;

  if (hoverClientX < hoverMiddleX) {
    return 'left';
  }

  if (hoverClientX >= hoverMiddleX) {
    return 'right';
  }

  return undefined;
};
