import type { Result, SerializedType } from '@decipad/language-interfaces';

// Row layout

export interface SmartProps {
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  aggregationExpression: string | undefined;
  aggregationResult: Result.AnyResult | undefined;
  rowSpan?: number;
  colSpan?: number;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
}

export interface HeaderProps {
  type?: SerializedType;
  value?: Result.OneResult;
  rowSpan?: number;
  colSpan?: number;
  collapsible?: boolean;
  alignRight?: boolean;
  isFullWidthRow?: boolean;
  groupId: string;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  groupLength: number;
  index: number;
  global?: boolean;
  rotate: boolean;
  isFirstLevelHeader: boolean;
  aggregationType?: string;
  aggregationResult: Result.Result | undefined;
  aggregationExpression: string | undefined;
}

export interface SmartRowColumn {
  name: string;
  result?: Result.AnyResult;
}

export interface SmartRowElement {
  elementType: 'smartrow';
  id?: string;
  type?: SerializedType;
  value?: Result.OneResult;
  aggregationExpression: string | undefined;
  children: DataGroup[];
  global?: boolean;
}

export interface DataGroupElement {
  elementType: 'group';
  id?: string;
  type?: SerializedType;
  value?: Result.OneResult;
  children: DataGroup[];
  collapsible?: boolean;
  global?: boolean;
  aggregationResult: Result.Result | undefined;
  aggregationExpression: string | undefined;
}

export type DataGroup = DataGroupElement | SmartRowElement;

// Data

export interface Column {
  name: string;
  blockId?: string;
  type: SerializedType;
}

// Aggregations

export type AggregationKind = string;

export type Aggregator = (params: {
  expressionFilter: string;
  columnType: string;
}) => string | undefined;
