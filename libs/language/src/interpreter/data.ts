import { getDefined } from '@decipad/utils';
import { DataTable } from '../data/DataTable';
import { Column, Table, Value } from './Value';

export async function evaluateData(data: DataTable): Promise<Table> {
  const colNames: string[] = [];
  const colValues: Column[] = [];

  for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
    const column = getDefined(
      data.getColumnAt(colIndex),
      `expected column at ${colIndex}`
    );
    colNames.push(column.name);
    // TODO: Here we're extracting the values and copying them to a column.
    // TODO: This is extremely innefficient. We should instead use values in the table directly.
    const values: Value[] = [];
    for (let rowIndex = 0; rowIndex < column.length; rowIndex += 1) {
      values.push(column.get(rowIndex));
    }
    colValues.push(Column.fromValues(values));
  }

  return Table.fromNamedColumns(colValues, colNames);
}
