import { MyEditor, MyElement, TableElement } from '@decipad/editor-types';
import { useCallback, useEffect, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import {
  findNodePath,
  focusEditor,
  getNodeChildren,
  getStartPoint,
  hasNode,
  setSelection,
} from '@udecode/plate';
import { ColumnDndDirection, DragColumnItem } from '../types';
import { getHoverDirection } from '../utils/getHoverDirection';
import { useTableActions } from './tableActions';

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
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer + 1);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const findSwappableColumns = useCallback(
    (
      columnItem: DragColumnItem,
      monitor: DropTargetMonitor
    ): [number, number] | void => {
      const path = findNodePath(editor, table);
      if (path) {
        const children = Array.from(getNodeChildren(editor, path));
        const firstRow = children[1];
        if (firstRow) {
          const columns = Array.from(getNodeChildren(editor, firstRow[1]));
          const sourceColumnIndex = columns.findIndex(
            (col) => columnItem.id === (col[0] as MyElement).id
          );
          const targetColumnIndex = columns.findIndex(
            (col) => column.id === (col[0] as MyElement).id
          );
          if (sourceColumnIndex >= 0 && targetColumnIndex >= 0) {
            const direction = getHoverDirection(editor, monitor, column);
            const swappableColumns: [number, number] = [
              sourceColumnIndex,
              direction === 'right'
                ? Math.min(targetColumnIndex, columns.length - 1)
                : Math.max(targetColumnIndex - 1, 0),
            ];
            return swappableColumns;
          }
        }
      }
    },
    [column, editor, table]
  );

  return useDrop<DragColumnItem, void, CollectedProps>(
    {
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
    },
    [timer] // every 0.5 seconds this reavaluates
  );
};
