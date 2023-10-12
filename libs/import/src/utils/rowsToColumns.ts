import type { Result } from '@decipad/remote-computer';

export const rowsToColumns = (result: Result.Result): Result.Result => {
  if (
    result.type.kind === 'materialized-column' &&
    result.type.cellType.kind === 'materialized-table' &&
    Array.isArray(result.value)
  ) {
    const table: Result.Result<'materialized-table'>['value'] = [];
    const ensureColumn = (colIndex: number) => {
      if (!table[colIndex]) {
        table[colIndex] = [];
      }
      return table[colIndex];
    };
    for (const subTable of result.value) {
      if (Array.isArray(subTable)) {
        subTable.forEach((column, colIndex) => {
          if (Array.isArray(column)) {
            const globalColumn = ensureColumn(colIndex);
            table[colIndex] = globalColumn.concat(column);
          }
        });
      } else {
        return result;
      }
    }

    return {
      type: result.type.cellType,
      value: table,
    };
  }
  return result;
};
