import { Realm } from './Realm';
import { TabularData } from '../data/TabularData';
import { Column, Value, fromJS } from './Value';

export async function evaluateData(
  realm: Realm,
  data: TabularData
): Promise<Value> {
  return await realm.stack.withPush(async () => {
    const colNames: string[] = [];
    const colValues: Value[] = [];

    for (const columnName of data.columnNames) {
      colValues.push(toValue(data.column(columnName)));
      colNames.push(columnName);
    }

    return Column.fromNamedValues(colValues, colNames);
  });
}

function toValue(values: any[]): Value {
  return Column.fromValues(values.map(fromJS));
}
