import { useContext, useMemo } from 'react';
import {
  MyEditor,
  TableCellElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDragNode } from '@udecode/plate-ui-dnd';
import { DRAG_ITEM_COLUMN, TableDndContext } from '../contexts/TableDndContext';

export const useDragColumn = (
  editor: MyEditor,
  element: TableHeaderElement | TableCellElement
) => {
  const tableDnd = useContext(TableDndContext);

  const [{ isDragging }, dragSource, dragPreview] = useDragNode(editor, {
    id: element.id,
    type: DRAG_ITEM_COLUMN,
    end: tableDnd.onCellDragEnd,
  });

  dragPreview(getEmptyImage(), { captureDraggingState: true });

  return useMemo(
    () => ({ isDragging, dragSource, dragPreview }),
    [isDragging, dragSource, dragPreview]
  );
};
