import type {
  ColumnDndDirection,
  DragColumnItem,
  MyReactEditor,
  TableHeaderElement,
} from '@decipad/editor-types';
import type { DropTargetMonitor } from 'react-dnd';
import type { TElement } from '@udecode/plate-common';
import { toDOMNode } from '@udecode/plate-common';
import type { MutableRefObject } from 'react';

export interface GetHoverDirectionOptions {
  dragItem?: DragColumnItem | TableHeaderElement;

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
