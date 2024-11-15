export type DragColumnItem = {
  id?: string;
  type?: string;
};

export type ColumnDndDirection = undefined | 'left' | 'right';

export type GoodToDragColumns = 'column' | 'DataViewColumn';

export const DRAG_ITEM_COLUMN = 'column';
export const DRAG_ITEM_DATAVIEW_COLUMN = 'DataViewColumn';

export const DRAG_BLOCK_ID = 'block-id';
export const DRAG_BLOCK_ID_CONTENT_TYPE = 'text/x-block-id';

export const DRAG_EXPRESSION = 'expression';
export const DRAG_EXPRESSION_CONTENT_TYPE = 'text/x-expression';

export const DEPRECATED_DRAG_EXPRESSION_IN_FRAGMENT =
  'deprecated-expression-fragment';
