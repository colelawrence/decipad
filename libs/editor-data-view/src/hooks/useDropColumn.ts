import { MyEditor, MyElement, DataViewElement } from '@decipad/editor-types';
import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import {
  ColumnDndDirection,
  DragColumnItem,
  findSwappableColumns,
  getHoverDirection,
} from '@decipad/editor-table';
import { useDataViewActions } from './useDataViewActions';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  table: DataViewElement,
  column: MyElement
) => {
  const { onMoveColumn } = useDataViewActions(editor, table);
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer + 1);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const swapCtx = {
    editor,
    table,
    column,
  };

  return useDrop<DragColumnItem, void, CollectedProps>(
    {
      accept: 'column',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        overDirection:
          (monitor.isOver() &&
            getHoverDirection(editor, { monitor, element: column })) ||
          undefined,
      }),
      drop: (columnItem, monitor) => {
        const columns = findSwappableColumns(swapCtx, columnItem, monitor);
        if (columns) {
          onMoveColumn(...columns);
        }
      },
    },
    [timer] // every 0.5 seconds this reavaluates
  );
};
