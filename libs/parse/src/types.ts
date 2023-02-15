import { ColIndex, TableCellType } from '@decipad/editor-types';
import { SerializedType } from '@decipad/computer';

export interface InferTableOptions {
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions?: Record<ColIndex, TableCellType>;
  doNotTryExpressionNumbersParse?: boolean;
}

export type SpreadsheetValue = string | boolean | number;

export type SpreadsheetRow = SpreadsheetValue[];

export type SpreadsheetColumn = SpreadsheetValue[];

export interface Sheet {
  values: SpreadsheetColumn[];
}

export interface CoercibleType {
  type: SerializedType;
  coerced?: string;
}

// dates

export type DateGranularity =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';

export type DateFormat = string;
