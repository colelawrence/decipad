import { Realm } from './Realm';
import { TabularData } from '../data/TabularData';
import { Column, Value, fromJS, Date as IDate } from './Value';
import { OneResult } from './interpreter-types';

export async function evaluateData(
  realm: Realm,
  data: TabularData
): Promise<Value> {
  return realm.stack.withPush(async () => {
    const colNames: string[] = [];
    const colValues: Value[] = [];

    for (const columnName of data.columnNames) {
      colValues.push(toValue(data.column(columnName)));
      colNames.push(columnName);
    }

    return Column.fromNamedValues(colValues, colNames);
  });
}

function toValue(values: (OneResult | Date)[]): Value {
  return Column.fromValues(values.map(fromJSOrDate));
}

function fromJSOrDate(value: OneResult | Date): Value {
  if (value instanceof Date) {
    return IDate.fromDateAndSpecificity(value.getTime(), 'time');
  }
  return fromJS(value);
}
