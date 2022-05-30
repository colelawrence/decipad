import { MyEditor, MyElement, PowerTableElement } from '@decipad/editor-types';
import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import {
  getHoverDirection,
  ColumnDndDirection,
  DragColumnItem,
  useFindSwappableColumns,
} from '@decipad/editor-table';
import { usePowerTableActions } from './powerTableActions';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  table: PowerTableElement,
  column: MyElement
) => {
  const { onMoveColumn } = usePowerTableActions(editor, table);
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer + 1);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const findSwappableColumns = useFindSwappableColumns(editor, table, column);

  return useDrop<DragColumnItem, void, CollectedProps>(
    {
      accept: 'column',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        overDirection:
          (monitor.isOver() && getHoverDirection(editor, monitor, column)) ||
          undefined,
      }),
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
