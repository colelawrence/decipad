import { Result } from '@decipad/computer';

export const rowsToColumns = (result: Result.Result): Result.Result => {
  if (
    result.type.kind === 'column' &&
    result.type.cellType.kind === 'table' &&
    Array.isArray(result.value)
  ) {
    const table: Result.Result<'table'>['value'] = [];
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
