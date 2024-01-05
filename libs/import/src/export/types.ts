export interface StringResult {
  type: 'string';
  value: string;
}

export interface BooleanResult {
  type: 'boolean';
  value: boolean;
}

export interface NumberResult {
  type: 'number';
  value: number;
  unit: string | null;
}

export interface ColumnValue {
  type: 'column';
  value: Array<FormattedResult>;
}

export interface TableResult {
  type: 'table';
  value: Array<ColumnValue>;
}

export type FormattedResult =
  | StringResult
  | BooleanResult
  | NumberResult
  | TableResult
  | ColumnValue;

export interface ExportedResult {
  // Block ID
  id: string;
  varName: string | undefined;
  result: FormattedResult;
}

export type VarnameExportedResult = Record<
  string,
  Omit<ExportedResult, 'varName'>
>;
