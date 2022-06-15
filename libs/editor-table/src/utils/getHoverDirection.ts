import { MyReactEditor } from '@decipad/editor-types';
import { DropTargetMonitor } from 'react-dnd';
import { TElement, toDOMNode } from '@udecode/plate';
import { ColumnDndDirection, DragColumnItem } from '../types';

export interface GetHoverDirectionOptions {
  dragItem?: DragColumnItem;

  monitor: DropTargetMonitor;

  element: TElement;
}

/**
 * If dragging a block A over another block B:
 * get the direction of block A relative to block B.
 */
export const getHoverDirection = (
  editor: MyReactEditor,
  { monitor, element, dragItem }: GetHoverDirectionOptions
): ColumnDndDirection => {
  if (dragItem) {
    // Don't replace items with themselves
    if (dragItem.id === element.id) return;
  }

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
