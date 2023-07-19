import type { SerializedType } from '@decipad/computer';
import {
  BaseElement,
  BlockElement,
  DEPRECATED_ELEMENT_INPUT,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  EmptyText,
  IntegrationTypes,
  PlainText,
} from '.';
import {
  ELEMENT_CAPTION,
  ELEMENT_DISPLAY,
  ELEMENT_DROPDOWN,
  ELEMENT_EXPRESSION,
  ELEMENT_IMPORT,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';
import type {
  DeprecatedTableInputElement,
  TableCellType,
  TableElement,
} from './table';

export type { TableElement };

export type ImportElementSource =
  | 'decipad'
  | 'codeconnection'
  | 'gsheets'
  | 'csv'
  | 'json'
  | 'postgresql'
  | 'mysql'
  | 'oracledb'
  | 'cockroachdb'
  | 'redshift'
  | 'mssql'
  | 'mariadb';

export const ImportElementSourcePretty: Record<ImportElementSource, string> = {
  decipad: 'Decipad',
  codeconnection: 'JS',
  gsheets: 'Google Sheets',
  csv: 'CSV',
  json: 'JSON',
  postgresql: 'Postgres',
  mysql: 'MySQL',
  oracledb: 'Oracle',
  cockroachdb: 'CockroachDB',
  redshift: 'RedShift',
  mssql: 'MySQL',
  mariadb: 'MariaDB',
};

export interface ImportElement extends BaseElement {
  type: typeof ELEMENT_IMPORT;
  source?: ImportElementSource;
  createdByUserId: string;
  url: string;
  children: [EmptyText];
}

// Live Connection

export interface LiveConnectionVarNameElement extends BaseElement {
  type: typeof ELEMENT_LIVE_CONNECTION_VARIABLE_NAME;
  children: [PlainText];
}

export interface LiveDataSetVarNameElement extends BaseElement {
  type: typeof ELEMENT_LIVE_DATASET_VARIABLE_NAME;
  children: [PlainText];
}

export type ColIndex = number;
export interface LiveConnectionElement extends BaseElement {
  type: typeof ELEMENT_LIVE_CONNECTION;
  url: string;
  proxy?: string;
  source?: ImportElementSource;
  externalDataSourceId?: string;
  isFirstRowHeaderRow: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  jsonPath?: string;
  delimiter?: string;
  children: [LiveConnectionVarNameElement];
}

export interface LiveDataSetElement extends BaseElement {
  type: typeof ELEMENT_LIVE_DATASET;
  url: string;
  proxy?: string;
  source?: ImportElementSource;
  externalDataSourceId?: string;
  isFirstRowHeaderRow: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  jsonPath?: string;
  delimiter?: string;
  children: [LiveDataSetVarNameElement, LiveQueryElement];
  hideLiveQueryResults?: boolean;
}

export interface LiveDataSetQueryElement extends BaseElement {
  type: typeof ELEMENT_LIVE_CONNECTION_VARIABLE_NAME;
  children: [PlainText];
}

// Live Query

export interface LiveQueryVarNameElement extends BaseElement {
  type: typeof ELEMENT_LIVE_QUERY_VARIABLE_NAME;
  children: [PlainText];
  isHidden?: boolean;
}

export interface LiveQueryQueryElement extends BaseElement {
  type: typeof ELEMENT_LIVE_QUERY_QUERY;
  connectionBlockId?: string;
  children: [PlainText];
  isHidden?: boolean;
}

export interface LiveQueryElement extends BaseElement {
  type: typeof ELEMENT_LIVE_QUERY;
  connectionBlockId?: string;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  children: [LiveQueryVarNameElement, LiveQueryQueryElement];
}

// legacy FetchElement
export interface FetchElement extends BaseElement {
  type: typeof ELEMENT_FETCH;
  children: [EmptyText];
  'data-auth-url': string;
  'data-contenttype': string;
  'data-error': string;
  'data-external-data-source-id': string;
  'data-external-id': string;
  'data-href': string;
  'data-provider': string;
  'data-varname': string;
}

export interface PlotElement extends BaseElement {
  type: typeof ELEMENT_PLOT;
  title?: string;
  colorScheme?: string;
  sourceVarName: string;
  markType:
    | 'bar'
    | 'circle'
    | 'square'
    | 'tick'
    | 'line'
    | 'area'
    | 'point'
    | 'arc';
  xColumnName: string;
  yColumnName: string;
  sizeColumnName: string;
  colorColumnName: string;
  thetaColumnName: string;
  children: [EmptyText];
  y2ColumnName: string;
}
export interface DeprecatedInputElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_INPUT;
  children: [EmptyText];
  value: string;
  variableName: string;
  icon: string;
  color: string;
}

export interface CaptionElement extends BaseElement {
  type: typeof ELEMENT_CAPTION;
  children: [PlainText];
  icon: string;
  color: string;
}

export interface ExpressionElement extends BaseElement {
  type: typeof ELEMENT_EXPRESSION;
  children: [PlainText];
}

/**
 * Display Element is what we call the Result widget.
 * It can display variables and calculations defined in the document
 */
export interface DisplayElement extends BaseElement {
  type: typeof ELEMENT_DISPLAY;
  /** blockId of the calculation/widget it is displaying */
  blockId: string;
  /**
    varName the last known variable name of the result, this is here
    because calculating it is expensive, so we need to cache it.
  */
  varName?: string;
  children: [EmptyText];
}

/**
 * Dropdown element defines the element that lives in a VariableDef
 * to enable dropdown behavior.
 */
export interface DropdownElement extends BaseElement {
  type: typeof ELEMENT_DROPDOWN;
  options: Array<{ id: string; value: string }>;
  smartSelection?: boolean;
  /** Used when it's a smart selection, to remember the column that is selected */
  selectedColumn?: string;
  children: [PlainText];
}

export interface SliderElement extends BaseElement {
  type: typeof ELEMENT_SLIDER;
  max: string;
  min: string;
  step: string;
  value: string;
  children: [EmptyText];
}

export type ElementVariants =
  | 'expression'
  | 'toggle'
  | 'date'
  | 'slider'
  | 'dropdown'
  | 'display';
export interface VariableBaseElement<
  V extends ElementVariants,
  T extends BlockElement[]
> extends BaseElement {
  type: typeof ELEMENT_VARIABLE_DEF;
  variant: V;
  children: [CaptionElement, ...T];
  coerceToType?: SerializedType;
}

export type VariableExpressionElement = VariableBaseElement<
  'expression',
  [ExpressionElement]
>;

export type VariableToggleElement = VariableBaseElement<
  'toggle',
  [ExpressionElement]
>;

export type VariableDateElement = VariableBaseElement<
  'date',
  [ExpressionElement]
>;

export type VariableDropdownElement = VariableBaseElement<
  'dropdown',
  [DropdownElement]
>;

export type VariableSliderElement = VariableBaseElement<
  'slider',
  [ExpressionElement, SliderElement]
>;

export type VariableDefinitionElement =
  | VariableToggleElement
  | VariableDateElement
  | VariableExpressionElement
  | VariableDropdownElement
  | VariableSliderElement;

export type InteractiveElement =
  | DeprecatedTableInputElement
  | TableElement
  | FetchElement
  | ImportElement
  | LiveConnectionElement
  | LiveDataSetElement
  | PlotElement
  | DisplayElement
  | DeprecatedInputElement
  | ExpressionElement
  | VariableDefinitionElement
  | LiveQueryElement
  | IntegrationTypes.IntegrationBlock;

export type VariableElement = VariableDefinitionElement | VariableSliderElement;
