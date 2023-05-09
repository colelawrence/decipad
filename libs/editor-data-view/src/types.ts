import { ColumnLike } from '@decipad/column';
import { Result, SerializedType } from '@decipad/computer';
import { Comparable } from '@decipad/universal-compare';
import { Subject } from 'rxjs';

// Row layout

export type ValueCell = Comparable;

export interface SmartProps {
  tableName: string;
  column: {
    type: SerializedType;
    value: ColumnLike<Comparable>;
    name: string;
  };
  roundings: Array<string | undefined>;
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  previousColumns: PreviousColumns;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
}

export interface HeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  collapsible?: boolean;
  onHover?: (hover: boolean) => void;
  hover?: boolean;
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
}

export interface SmartRowColumn {
  name: string;
  type: SerializedType;
  value: ColumnLike<Comparable>;
}

interface BaseElement {
  columnIndex: number;
  parentHighlight$?: Subject<boolean>;
  selfHighlight$?: Subject<boolean>;
}

export interface SmartRowElement extends BaseElement {
  elementType: 'smartrow';
  id?: string;
  type?: never;
  value?: never;
  children: DataGroup[];
  column: SmartRowColumn;
  columnIndex: number;
  previousColumns: {
    type: SerializedType;
    value: Comparable | undefined;
    name: string;
  }[];
  global?: boolean;
}

export interface DataGroupElement extends BaseElement {
  elementType: 'group';
  id?: string;
  type?: SerializedType;
  value?: ValueCell;
  children: DataGroup[];
  collapsible?: boolean;
  column?: never;
  global?: boolean;
}

export type DataGroup = DataGroupElement | SmartRowElement;

export type DataViewDataLayout = DataGroup[];

// Data

export interface Column {
  name: string;
  blockId?: string;
  type: SerializedType;
  value: Result.Result<'materialized-column'>['value'];
}

export type ImmaterializedColumn = Omit<Column, 'value'> & {
  value: Result.Result<'column'>['value'];
};

export interface VirtualColumn {
  name: string;
  blockId?: string;
  type: SerializedType;
  value: ColumnLike<Comparable>;
}

// Aggregations

export type AggregationKind = string;

export type Aggregator = (params: {
  expressionFilter: string;
  columnType: string;
}) => string | undefined;

export type PreviousColumns = Array<{
  type: SerializedType;
  value: Comparable | undefined;
  name: string;
}>;
