import type { EmptyText } from '.';
import { Text } from '.';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TABLE_INPUT,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from './element-kinds';
import type { BaseElement } from './value';
import type { TableCellType, TableData } from './tables-legacy';

export interface TableColumnFormulaElement extends BaseElement {
  type: typeof ELEMENT_TABLE_COLUMN_FORMULA;
  columnId: string;
  children: [Text];
}

export interface TableVariableNameElement extends BaseElement {
  type: typeof ELEMENT_TABLE_VARIABLE_NAME;
  children: [Text];
}
export interface TableCaptionElement extends BaseElement {
  type: typeof ELEMENT_TABLE_CAPTION;
  children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
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
  cellType: TableCellType;
  autoCreated?: boolean;
  children: [Text];
}

export interface TableHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_TR;
  children: TableHeaderElement[];
}

export interface TableElement extends BaseElement {
  type: typeof ELEMENT_TABLE;
  children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
  color?: string;
  icon?: string;
}

// legacy
export interface TableInputElement extends BaseElement {
  type: typeof ELEMENT_TABLE_INPUT;
  tableData: TableData; // legacy table data
  children: [EmptyText];
}
