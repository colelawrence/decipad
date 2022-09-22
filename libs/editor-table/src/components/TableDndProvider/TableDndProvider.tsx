import React, { useCallback, useState } from 'react';

import {
  findSwappableColumns,
  getHoverDirection,
  useTableActions,
} from '@decipad/editor-table';
import {
  MyEditor,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import {
  CellDndProps,
  ColumnDropLine,
  TableDndContext,
} from '../../contexts/TableDndContext';
import { findColumnAndDragItem } from '../../utils/findColumnAndDragItem';
import { focusEditorForColumnDnd } from '../../utils/focusEditorForColumnDnd';

export const TableDndProvider = ({
  editor,
  table,
  children,
}: React.PropsWithChildren<{
  editor: MyEditor;
  table: TableElement;
}>) => {
  const { onMoveColumn } = useTableActions(editor, table);
  const [columnDropLine, setColumnDropLine] = useState<ColumnDropLine | null>(
    null
  );
  const dropLine = columnDropLine?.direction;

  const onCellHover = useCallback(
    (props: CellDndProps) => {
      const dnd = findColumnAndDragItem(editor, table, props);
      if (!dnd) return;

      const direction = getHoverDirection(editor, {
        monitor: props.monitor,
        element: props.cell,
        dragItem: props.dragItem,
      });

      if (dropLine !== direction) {
        const element = props.cell as TableHeaderElement;
        setColumnDropLine(direction ? { direction, element } : null);
      }

      const columns = findSwappableColumns(
        dnd.swapCtx,
        dnd.dragItem,
        props.monitor
      );
      if (!columns) return;

      focusEditorForColumnDnd(editor, table, columns);
    },
    [dropLine, editor, table]
  );

  const onCellDrop = useCallback(
    (props: CellDndProps) => {
      const dnd = findColumnAndDragItem(editor, table, props);
      if (!dnd) return;

      const columns = findSwappableColumns(
        dnd.swapCtx,
        dnd.dragItem,
        props.monitor
      );

      if (columns) {
        onMoveColumn(...columns);
      }
    },
    [editor, onMoveColumn, table]
  );

  const onCellDragEnd = useCallback(
    () => setColumnDropLine(null),
    [setColumnDropLine]
  );

  const tableDndContextValue = {
    onCellHover,
    onCellDrop,
    onCellDragEnd,
    columnDropLine,
  };

  return (
    <TableDndContext.Provider value={tableDndContextValue}>
      {children}
    </TableDndContext.Provider>
  );
};
