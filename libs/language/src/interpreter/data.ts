import { getDefined } from '@decipad/utils';
import { Realm } from './Realm';
import { DataTable } from '../data/DataTable';
import { Column, Value } from './Value';

type Scalar = number | string | boolean;

export async function evaluateData(
  realm: Realm,
  data: DataTable
): Promise<Value> {
  return realm.stack.withPush(async () => {
    const colNames: string[] = [];
    const colValues: Value[] = [];

    for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
      const column = getDefined(
        data.getColumnAt(colIndex),
        `expected column at ${colIndex}`
      );
      colNames.push(column.name);
      // TODO: Here we're extracting the values and copying them to a column.
      // TODO: This is extremely innefficient. We should instead use values in the table directly.
      const values: Scalar[] = [];
      for (let rowIndex = 0; rowIndex < column.length; rowIndex += 1) {
        values.push(column.get(rowIndex));
      }
      colValues.push({
        cardinality: 1,
        getData: () => values,
      });
    }

    return Column.fromNamedValues(colValues, colNames);
  });
}
