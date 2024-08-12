import { Result } from '@decipad/language-interfaces';
import { formatUnit } from '@decipad/format';
import { simpleMatrixFormatResult } from './simpleMatrixFormatResult';

const defaultLocale = 'en-US';

export const exportToSimpleMatrix = (
  table: Result.Result<'materialized-table'>
): Array<Array<string | number | boolean>> => {
  const output = [];

  // columns
  const columnsNames = table.type.columnNames.map((name, index) => {
    const type = table.type.columnTypes[index];
    if (type?.kind === 'number' && type.unit) {
      const unit = formatUnit(defaultLocale, type.unit);
      if (unit) {
        return `${name} (${unit})`;
      }
    }
    return name;
  });
  output.push(columnsNames);

  const columns = table.value;
  const maxRows = columns.reduce((acc, col) => {
    return col.length > acc ? col.length : acc;
  }, 0);
  const { columnTypes } = table.type;
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const row = [];
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const value = column[rowIndex];
      row.push(
        simpleMatrixFormatResult(defaultLocale, value, columnTypes[colIndex])
      );
    }
    output.push(row);
  }

  return output;
};
