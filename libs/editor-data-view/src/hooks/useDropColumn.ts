import type { ColumnDndDirection, DragColumnItem } from '@decipad/editor-table';
import { findSwappableColumns, getHoverDirection } from '@decipad/editor-table';
import type {
  DataViewElement,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import type { GoodToDragColumns } from 'libs/editor-table/src/contexts/TableDndContext';
import { DRAG_ITEM_DATAVIEW_COLUMN } from 'libs/editor-table/src/contexts/TableDndContext';
import type { MutableRefObject } from 'react';
import { useState, useMemo } from 'react';
import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { dndStore } from '@udecode/plate-dnd';
import { findNodePath } from '@udecode/plate-common';
import { useDataViewActions } from './useDataViewActions';

interface CollectedProps {
  isOver: boolean;
  overDirection: ColumnDndDirection;
  isOverCurrent: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDropColumn = (
  editor: MyEditor,
  table: DataViewElement | undefined,
  column: MyElement,
  columnHeaderRef: MutableRefObject<HTMLTableCellElement | null>,
  columnType: GoodToDragColumns = DRAG_ITEM_DATAVIEW_COLUMN
): [CollectedProps, ConnectDropTarget, 'left' | 'right' | undefined] => {
  const { onMoveColumn } = useDataViewActions(editor, table);
  const [hoverDirection, setHoverDirection] = useState<
    'left' | 'right' | undefined
  >(undefined);

  const tablePath = useMemo(
    () => table && findNodePath(editor, table),
    [editor, table]
  );

  const swapCtx = tablePath && {
    editor,
    tablePath,
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
        // hack: we do not use the dnd store
        // for handling data views drags,
        // but that store is set dragging
        // after the drag stops.
        // Probably related to the slate errors
        // on the drag handlers...
        dndStore.set.isDragging(false);
        // eslint-disable-next-line no-param-reassign
        editor.isDragging = false;
      },
      drop: (columnItem, monitor) => {
        const columns =
          swapCtx &&
          findSwappableColumns(swapCtx, columnItem, monitor, hoverDirection);
        if (columns) {
          onMoveColumn(...columns);

          // see above comnent about the plate dnd store
          dndStore.set.isDragging(false);
          // eslint-disable-next-line no-param-reassign
          editor.isDragging = false;
        }
      },
    } // every 0.5 seconds this reavaluates
  );

  return [...useDropResult, hoverDirection];
};
