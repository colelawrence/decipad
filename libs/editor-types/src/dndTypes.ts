export type DragColumnItem = {
  id?: string;
  type?: string;
};

export type ColumnDndDirection = undefined | 'left' | 'right';

export type GoodToDragColumns = 'column' | 'DataViewColumn';

export const DRAG_ITEM_COLUMN = 'column';
export const DRAG_ITEM_DATAVIEW_COLUMN = 'DataViewColumn';

export const DRAG_SMART_CELL = 'smart-cell';
