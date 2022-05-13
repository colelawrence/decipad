import { Element, TableElement } from '@decipad/editor-types';
import { findPath } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ColumnDndDirection, DragColumnItem } from '../types';
import { getHoverDirection } from '../utils/getHoverDirection';
import { useTableActions } from './tableActions';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: ReactEditor,
  table: TableElement,
  column: Element
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
      const path = findPath(editor, table);
      if (path) {
        const children = Array.from(Node.children(editor, path));
        const firstRow = children[1];
        if (firstRow) {
          const columns = Array.from(Node.children(editor, firstRow[1]));
          const sourceColumnIndex = columns.findIndex(
            (col) => columnItem.id === (col[0] as Element).id
          );
          const targetColumnIndex = columns.findIndex(
            (col) => column.id === (col[0] as Element).id
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
          ReactEditor.focus(editor);
          const tablePath = findPath(editor, table);
          if (tablePath) {
            const thPath = [...tablePath, 1, columns[1]];
            if (Editor.hasPath(editor, thPath)) {
              const newFocus = Editor.start(editor, thPath);
              Transforms.setSelection(editor, {
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
