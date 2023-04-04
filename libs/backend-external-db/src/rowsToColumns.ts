import { getDefined } from '@decipad/utils';

export const rowsToColumns = (
  rows: Array<Record<string, unknown>>
): Record<string, Array<unknown>> => {
  const columns: Record<string, Array<unknown>> = {};

  const ensureColumn = (columnName: string): Array<unknown> => {
    if (!columns[columnName]) {
      columns[columnName] = [];
    }
    return getDefined(columns[columnName]);
  };

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      const column = ensureColumn(key);
      column.push(value);
    }
  }

  return columns;
};
