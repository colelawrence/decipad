import React, { useCallback, useState, useMemo } from 'react';

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
import { dndStore } from '@udecode/plate-dnd';
import { findNodePath } from '@udecode/plate';
import { Path } from 'slate';
import {
  CellDndProps,
  ColumnDropLine,
  TableDndContext,
} from '../../contexts/TableDndContext';
import { findColumnAndDragItem } from '../../utils/findColumnAndDragItem';
import { focusEditorForColumnDnd } from '../../utils/focusEditorForColumnDnd';

// TODO: Refactor or replace with alternative solution
const useMemoPath = <T extends Path | null | undefined>(path: T): T =>
  useMemo(() => path, [path]);

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

  const tablePath = useMemoPath(
    useMemo(() => findNodePath(editor, table), [editor, table])
  );

  const onCellHover = useCallback(
    (props: CellDndProps) => {
      const dnd = findColumnAndDragItem(editor, tablePath, props);
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

      focusEditorForColumnDnd(editor, tablePath, columns);
    },
    [dropLine, editor, tablePath]
  );

  const onCellDrop = useCallback(
    (props: CellDndProps) => {
      const dnd = findColumnAndDragItem(editor, tablePath, props);
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
    [editor, onMoveColumn, tablePath]
  );

  const onCellDragEnd = useCallback(() => {
    dndStore.set.isDragging(false);
    // eslint-disable-next-line no-param-reassign
    editor.isDragging = false;
    setColumnDropLine(null);
  }, [editor]);

  const tableDndContextValue = React.useMemo(
    () => ({
      onCellHover,
      onCellDrop,
      onCellDragEnd,
      columnDropLine,
    }),
    [onCellHover, onCellDrop, onCellDragEnd, columnDropLine]
  );

  return (
    <TableDndContext.Provider value={tableDndContextValue}>
      {children}
    </TableDndContext.Provider>
  );
};
