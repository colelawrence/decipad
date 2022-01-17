import { getDefined } from '@decipad/utils';
import { DataTable, toInternalType } from '../data/DataTable';
import { Type, build as t } from '../type';

export async function inferData(
  indexName: string | null,
  data: DataTable
): Promise<Type> {
  const columnTypes: Type[] = [];
  const columnNames: string[] = [];

  for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
    const column = getDefined(data.getColumnAt(colIndex));
    const columnType: Type = toInternalType(column.type.toString());
    columnTypes.push(columnType);
    columnNames.push(column.name);
  }

  return t.table({
    indexName,
    length: data.length,
    columnTypes,
    columnNames,
  });
}
