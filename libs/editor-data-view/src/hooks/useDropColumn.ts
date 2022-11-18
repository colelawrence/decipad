import { MyEditor, MyElement, DataViewElement } from '@decipad/editor-types';
import { ConnectDropTarget, useDrop } from 'react-dnd';
import {
  ColumnDndDirection,
  DragColumnItem,
  findSwappableColumns,
  getHoverDirection,
} from '@decipad/editor-table';
import { MutableRefObject, useState } from 'react';
import { useDataViewActions } from './useDataViewActions';
import { ColumnType } from './useDragColumn';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
  isOverCurrent: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  table: DataViewElement,
  column: MyElement,
  columnHeaderRef: MutableRefObject<HTMLTableCellElement | null>,
  columnType: ColumnType = 'TableColumn'
): [CollectedProps, ConnectDropTarget, 'left' | 'right' | undefined] => {
  const { onMoveColumn } = useDataViewActions(editor, table);
  const [hoverDirection, setHoverDirection] = useState<
    'left' | 'right' | undefined
  >(undefined);

  const swapCtx = {
    editor,
    table,
    column,
  };

  const useDropResult = useDrop<DragColumnItem, void, CollectedProps>(
    {
      accept: columnType,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        overDirection:
          getHoverDirection(editor, {
            monitor,
            element: column,
            ref: columnHeaderRef,
          }) || undefined,
      }),
      hover: (_, monitor) => {
        setHoverDirection(
          getHoverDirection(editor, {
            monitor,
            element: column,
            ref: columnHeaderRef,
          })
        );
      },
      drop: (columnItem, monitor) => {
        const columns = findSwappableColumns(swapCtx, columnItem, monitor);
        if (columns) {
          onMoveColumn(...columns);
        }
      },
    } // every 0.5 seconds this reavaluates
  );

  return [...useDropResult, hoverDirection];
};
