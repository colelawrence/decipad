import { Result } from '@decipad/language';

export interface ColumnDesc {
  tableName: string;
  columnName: string;
  result: Result.Result<'column'>;
  blockId?: string;
}

export interface TableDesc {
  id: string;
  tableName: string;
}

export interface MaterializedColumnDesc {
  tableName: string;
  columnName: string;
  result: Result.Result<'materialized-column'>;
  blockId?: string;
}

export interface DimensionExplanation {
  indexedBy: string | undefined;
  labels: readonly string[] | undefined;
  dimensionLength: number;
}
