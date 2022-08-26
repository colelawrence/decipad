import { Result, SerializedType, Interpreter } from '@decipad/computer';
import { Subject } from 'rxjs';

// Row layout

export type ValueCell = Result.Comparable;
export interface SmartRowColumn {
  name: string;
  type: SerializedType;
  value: Result.ColumnLike<Result.Comparable>;
}

interface BaseElement {
  columnIndex: number;
  parentHighlight$?: Subject<boolean>;
  selfHighlight$?: Subject<boolean>;
}

export interface SmartRowElement extends BaseElement {
  elementType: 'smartrow';
  type?: never;
  value?: never;
  children: DataGroup[];
  column: SmartRowColumn;
  columnIndex: number;
  subproperties: { value: Result.Comparable; name: string }[];
}

export interface DataGroupElement extends BaseElement {
  elementType: 'group';
  type?: SerializedType;
  value?: ValueCell;
  children: DataGroup[];
  column?: never;
}

export type DataGroup = DataGroupElement | SmartRowElement;

export type DataViewDataLayout = DataGroup[];

// Data

export type ColumnNames = string[];
export type ColumnTypes = SerializedType[];
export type Columns = [ColumnNames, ColumnTypes, Interpreter.ResultTable];

// Aggregations

export type AggregationKind =
  | 'min'
  | 'max'
  | 'average'
  | 'median'
  | 'sum'
  | 'span';

export type Aggregator = (params: {
  expressionFilter: string;
  columnType: string;
}) => string | undefined;
