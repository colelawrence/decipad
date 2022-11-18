import { MyReactEditor } from '@decipad/editor-types';
import { DropTargetMonitor } from 'react-dnd';
import { TElement, toDOMNode } from '@udecode/plate';
import { MutableRefObject } from 'react';
import { ColumnDndDirection, DragColumnItem } from '../types';

export interface GetHoverDirectionOptions {
  dragItem?: DragColumnItem;

  monitor: DropTargetMonitor;

  element?: TElement;

  ref?: MutableRefObject<HTMLTableCellElement | null>;
}

/**
 * If dragging a block A over another block B:
 * get the direction of block A relative to block B.
 */
export const getHoverDirection = (
  editor: MyReactEditor,
  { monitor, element, dragItem, ref }: GetHoverDirectionOptions
): ColumnDndDirection => {
  if (dragItem) {
    // Don't replace items with themselves
    if (element && dragItem.id === element.id) return;
  }

  const node = element && toDOMNode(editor, element);
  if (!node && !ref) return;

  // Determine rectangle on screen
  const hoverBoundingRect = node
    ? node.getBoundingClientRect()
    : ref && ref.current?.getBoundingClientRect();
  if (!hoverBoundingRect) return;

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
