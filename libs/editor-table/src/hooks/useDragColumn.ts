import type {
  DataViewHeader,
  MyEditor,
  TableCellElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useDragNode } from '@udecode/plate-dnd';
import { getEmptyImage } from '@decipad/ui';
import { useContext, useMemo } from 'react';
import type { GoodToDragColumns } from '../contexts/TableDndContext';
import { TableDndContext } from '../contexts/TableDndContext';

export const useDragColumn = (
  editor: MyEditor,
  element: TableHeaderElement | TableCellElement | DataViewHeader,
  elementType: GoodToDragColumns
) => {
  const tableDnd = useContext(TableDndContext);

  const [{ isDragging }, dragSource, dragPreview] = useDragNode(editor, {
    id: element.id,
    type: elementType,
    end: tableDnd.onCellDragEnd,
  });

  dragPreview(getEmptyImage(), { captureDraggingState: true });

  return useMemo(
    () => ({ isDragging, dragSource, dragPreview }),
    [isDragging, dragSource, dragPreview]
  );
};
