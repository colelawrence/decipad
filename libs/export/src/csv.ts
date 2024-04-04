import type { Result } from '@decipad/remote-computer';
import { simpleFormatResult } from './simpleFormat';
import { formatUnit } from '@decipad/format';

const defaultLocale = 'en-US';

export const exportCsv = (
  table: Result.Result<'materialized-table'>
): string => {
  let output = '';

  // columns
  output += table.type.columnNames
    .map((name, index) => {
      const type = table.type.columnTypes[index];
      if (type?.kind === 'number' && type.unit) {
        const unit = formatUnit(defaultLocale, type.unit);
        if (unit) {
          return `${name} (${unit})`;
        }
      }
      return name;
    })
    .join();

  const columns = table.value;
  const maxRows = columns.reduce((acc, col) => {
    return col.length > acc ? col.length : acc;
  }, 0);
  const { columnTypes } = table.type;
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    output += '\n';
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const value = column[rowIndex];
      output += simpleFormatResult(defaultLocale, value, columnTypes[colIndex]);
      if (colIndex < columns.length - 1) {
        output += ',';
      }
    }
  }

  return output;
};
