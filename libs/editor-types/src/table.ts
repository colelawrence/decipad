import type { EmptyText } from '.';
import {
  ELEMENT_TABLE_INPUT,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
} from './element-kinds';
import type { BaseElement, Text } from './elements';
import type { TableData, TableCellType } from './tables-legacy';

export interface TableCaptionElement extends BaseElement {
  type: typeof ELEMENT_TABLE_CAPTION;
  children: [Text];
}
export interface TableCellElement extends BaseElement {
  type: typeof ELEMENT_TD;
  children: [Text];
}

export interface TableRowElement extends BaseElement {
  type: typeof ELEMENT_TR;
  autoCreated?: boolean;
  children: TableCellElement[];
}

export interface TableHeaderElement extends BaseElement {
  type: typeof ELEMENT_TH;
  columnWidth?: number;
  autoCreated?: boolean;
  cellType: TableCellType;
  children: [Text];
}

export interface TableHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_TR;
  children: TableHeaderElement[];
}

export interface TableElement extends BaseElement {
  type: typeof ELEMENT_TABLE;
  children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
}

// legacy
export interface TableInputElement extends BaseElement {
  type: typeof ELEMENT_TABLE_INPUT;
  tableData: TableData; // legacy table data
  children: [EmptyText];
}
