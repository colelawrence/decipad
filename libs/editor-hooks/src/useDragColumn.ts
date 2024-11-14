import type {
  DataViewHeader,
  GoodToDragColumns,
  MyEditor,
  TableCellElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { UseDragNodeOptions, useDragNode } from '@udecode/plate-dnd';
import { useMemo } from 'react';
import { getEmptyImage } from '@decipad/editor-utils';

export const useDragColumn = (
  editor: MyEditor,
  element: TableHeaderElement | TableCellElement | DataViewHeader,
  elementType: GoodToDragColumns,
  onCellDragEnd: UseDragNodeOptions['end']
) => {
  const [{ isDragging }, dragSource, dragPreview] = useDragNode(editor, {
    id: element.id,
    type: elementType,
    end: onCellDragEnd,
  });

  dragPreview(getEmptyImage(), { captureDraggingState: true });

  return useMemo(
    () => ({ isDragging, dragSource, dragPreview }),
    [isDragging, dragSource, dragPreview]
  );
};
