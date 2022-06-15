import { MyEditor, MyElement, TableElement } from '@decipad/editor-types';
import { useDrop } from 'react-dnd';
import {
  findNodePath,
  focusEditor,
  getStartPoint,
  hasNode,
  setSelection,
} from '@udecode/plate';
import { ColumnDndDirection, DragColumnItem } from '../types';
import { getHoverDirection } from '../utils/getHoverDirection';
import { useTableActions } from './tableActions';
import { useFindSwappableColumns } from './useFindSwappableColumns';
import { DRAG_ITEM_COLUMN } from '../components/index';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  {
    column,
    table,
    dropLine,
    onChangeDropLine,
  }: {
    table: TableElement;
    column: MyElement;
    dropLine: ColumnDndDirection;
    isDragging: boolean;
    onChangeDropLine: (newValue: ColumnDndDirection) => void;
  }
) => {
  const { onMoveColumn } = useTableActions(editor, table);
  const findSwappableColumns = useFindSwappableColumns(editor, {
    table,
    column,
  });

  return useDrop<DragColumnItem, void, CollectedProps>({
    accept: DRAG_ITEM_COLUMN,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      overDirection:
        (monitor.isOver() &&
          getHoverDirection(editor, { monitor, element: column })) ||
        undefined,
    }),
    hover: (dragItem, monitor) => {
      const direction = getHoverDirection(editor, {
        monitor,
        element: column,
        dragItem,
      });

      if (dropLine !== direction) {
        onChangeDropLine(direction);
      }

      const columns = findSwappableColumns(dragItem, monitor);
      if (!columns) return;

      focusEditor(editor);

      const tablePath = findNodePath(editor, table);
      if (!tablePath) return;

      const thPath = [...tablePath, 1, columns[1]];
      if (hasNode(editor, thPath)) {
        const newFocus = getStartPoint(editor, thPath);
        setSelection(editor, {
          focus: newFocus,
          anchor: newFocus,
        });
      }
    },
    drop: (columnItem, monitor) => {
      const columns = findSwappableColumns(columnItem, monitor);
      if (columns) {
        onMoveColumn(...columns);
      }
    },
  });
};
