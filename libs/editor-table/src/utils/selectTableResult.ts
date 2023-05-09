import { Result, SerializedType, isTableResult } from '@decipad/computer';
import { empty } from '@decipad/generator-utils';
import { TableColumn } from '..';

const unknownResult: Result.Result<'pending'> = {
  type: {
    kind: 'pending',
  },
  value: Result.Unknown,
};

type ColumnReplacement = Omit<TableColumn, 'blockId'> & {
  value: Result.OneResult;
};

const createEmptyColumnResult = (column: TableColumn): ColumnReplacement => ({
  ...column,
  value: () => empty(),
});

const fixTableResult = (
  result: Result.Result<'table' | 'materialized-table'>,
  columns: TableColumn[]
): Result.Result<'table' | 'materialized-table'> => {
  const replaceWithColumns = columns.map((col): ColumnReplacement => {
    const columnIndex = result.type.columnNames.findIndex(
      (columnName) => columnName === col.name
    );
    return columnIndex != null
      ? {
          name: col.name,
          cellType: result.type.columnTypes[columnIndex] ?? col.cellType,
          value: result.value[columnIndex],
        }
      : createEmptyColumnResult(col);
  });

  return {
    type: {
      ...result.type,
      columnNames: replaceWithColumns.map((col) => col.name),
      columnTypes: replaceWithColumns.map(
        (col) => col.cellType as SerializedType
      ),
    },
    value: replaceWithColumns.map((col) => col.value) as Result.Result<
      'table' | 'materialized-table'
    >['value'],
  };
};

export const selectTableResult = (
  result: Result.Result | undefined,
  columns: TableColumn[]
):
  | Result.Result<'table' | 'materialized-table'>
  | Result.Result<'pending'>
  | Result.Result<'type-error'> => {
  if (isTableResult(result)) {
    return fixTableResult(result, columns);
  }
  if (result?.type.kind === 'type-error') {
    return result as Result.Result<'type-error'>;
  }
  return unknownResult;
};
