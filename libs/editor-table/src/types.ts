import type { Range } from 'slate';
import type { CellValueType, TableHeaderElement } from '@decipad/editor-types';
import { DECORATION_CELL_UNIT } from './constants';

export interface DecorationCellUnit extends Range {
  [DECORATION_CELL_UNIT]: true;
  unitString: string;
}

export interface DragColumnItem {
  id: string;
  type?: string;
}

export type ColumnDndDirection = undefined | 'left' | 'right';

export interface TotalAggregationExpressions {
  sum: string;
}

export interface DropdownOption {
  id: string;
  value: string;
  focused: boolean;
}

export interface TableColumn {
  blockId: string;
  name: string;
  cellType: CellValueType;
  width: number | undefined;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  headers: TableHeaderElement[];
  rowCount: number;
}
