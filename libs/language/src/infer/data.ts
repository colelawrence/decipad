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
    const columnMeta = data.schema.fields[colIndex];
    try {
      const column = getDefined(data.getChildAt(colIndex));
      const columnType: Type = toInternalType(column.type.toString());
      columnTypes.push(columnType);
      columnNames.push(columnMeta.name);
    } catch (err) {
      return t.impossible(
        `Error inferring type of column ${columnMeta.name}: ${
          (err as Error).message
        }`
      );
    }
  }

  return t.table({
    indexName,
    length: data.numRows,
    columnTypes,
    columnNames,
  });
}
