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

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  table: TableElement,
  column: MyElement
) => {
  const { onMoveColumn } = useTableActions(editor, table);

  const findSwappableColumns = useFindSwappableColumns(editor, table, column);

  return useDrop<DragColumnItem, void, CollectedProps>({
    accept: 'column',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      overDirection:
        (monitor.isOver() && getHoverDirection(editor, monitor, column)) ||
        undefined,
    }),
    hover: (columnItem, monitor) => {
      const columns = findSwappableColumns(columnItem, monitor);
      if (columns) {
        focusEditor(editor);
        const tablePath = findNodePath(editor, table);
        if (tablePath) {
          const thPath = [...tablePath, 1, columns[1]];
          if (hasNode(editor, thPath)) {
            const newFocus = getStartPoint(editor, thPath);
            setSelection(editor, {
              focus: newFocus,
              anchor: newFocus,
            });
          }
        }
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
