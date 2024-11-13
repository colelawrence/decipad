import type {
  MyElement,
  TableHeaderElement,
  ColumnDndDirection,
  DragColumnItem,
} from '@decipad/editor-types';
import { createContext } from 'react';
import type { DropTargetMonitor } from 'react-dnd';

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
