import type { SerializedTypes } from '@decipad/computer';

import type { EmptyText, PlainText, SmartRefElement, Text } from '.';
import type {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from './element-kinds';
import type { BaseElement } from './value';

export type SeriesType = 'date'; // only date for now, but we could have others

/**
 * Used throughout the table header menu
 * @field value is the name of the dropdown
 */
export type ColumnMenuDropdown = {
  id: string;
  value: string;
  type: 'string' | 'number';
};

/**
 * Dropdown type for table columns.
 * @field id is the reference to the actual dropdown component.
 * @field type is the current type of the dropdown component, stored here so we can
 * use it for changing the icon, instead of asking the computer.
 */
export type TableDropdownType = Readonly<{
  kind: 'dropdown';
  id: string;
  type: 'string' | 'number';
}>;

export type TableCellType =
  | SerializedTypes.Number
  | SerializedTypes.String
  | SerializedTypes.Boolean
  | SerializedTypes.Date
  | SerializedTypes.Anything
  | TableDropdownType
  | Readonly<{ kind: 'table-formula' }>
  | Readonly<{ kind: 'series'; seriesType: SeriesType }>;

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}

export interface TableColumnFormulaElement extends BaseElement {
  type: typeof ELEMENT_TABLE_COLUMN_FORMULA;
  columnId: string;
  children: (PlainText | SmartRefElement)[];
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
  aggregation?: string;
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
  isCollapsed?: boolean;
  hideFormulas?: boolean;
}

// legacy
export interface DeprecatedTableInputElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_TABLE_INPUT;
  tableData: TableData; // legacy table data
  children: [EmptyText];
}
