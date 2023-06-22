import type { MyElement, TableHeaderElement } from '@decipad/editor-types';
import { createContext } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import type { ColumnDndDirection, DragColumnItem } from '..';

export type GoodToDragColumns = 'column' | 'DataViewColumn';
export const DRAG_ITEM_COLUMN = 'column';
export const DRAG_ITEM_DATAVIEW_COLUMN = 'DataViewColumn';

export type CellDndProps = {
  dragItem: DragColumnItem;
  monitor: DropTargetMonitor<DragColumnItem, void>;
  cell: MyElement;
};

export type ColumnDropLine = {
  element: TableHeaderElement;
  direction: NonNullable<ColumnDndDirection>;
};

interface TableDndContextValue {
  onCellHover(props: CellDndProps): void;
  onCellDrop(props: CellDndProps): void;
  onCellDragEnd(): void;
  columnDropLine: ColumnDropLine | null;
}

export const TableDndContext = createContext<TableDndContextValue>({
  onCellHover() {},
  onCellDrop() {},
  onCellDragEnd() {},
  columnDropLine: null,
});
