import { Element } from '@decipad/editor-types';
import { DropTargetMonitor } from 'react-dnd';
import { ReactEditor } from 'slate-react';
import { ColumnDndDirection } from '../types';

/**
 * If dragging a block A over another block B:
 * get the direction of block A relative to block B.
 */
export const getHoverDirection = (
  editor: ReactEditor,
  monitor: DropTargetMonitor,
  element: Element
): ColumnDndDirection => {
  let node: HTMLElement;
  try {
    node = ReactEditor.toDOMNode(editor, element);
  } catch (err) {
    return undefined;
  }

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
