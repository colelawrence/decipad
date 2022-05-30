import { Result, SerializedType, Interpreter } from '@decipad/computer';

export type ValueCell = Result.Comparable;

export interface RowLayout {
  value: ValueCell;
  type: SerializedType;
  rest: RowLayout[];
  rowSpan: number;
}

export type PowerTableDataLayout = RowLayout[];

export type ColumnNames = string[];
export type ColumnTypes = SerializedType[];
export type Columns = [ColumnNames, ColumnTypes, Interpreter.ResultTable];
