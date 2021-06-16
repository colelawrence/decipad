import { Context } from './context';
import { TabularData } from '../data/TabularData';
import { Type } from '../type';

export async function inferData(
  data: TabularData,
  ctx: Context
): Promise<Type> {
  ctx.inTable = true;
  const tableType = await ctx.stack.withPush(() => {
    const columnDefs: Type[] = [];
    const columnNames = data.columnNames;
    for (const columnName of columnNames) {
      let columnType: Type | undefined = undefined;
      for (let row = 0; row < data.length; row++) {
        const value = data.get(columnName, row);
        const newType = typeFromValue(value);
        if (columnType && !columnType.sameAs(newType)) {
          throw new Error(
            `column ${columnName} is inconsistent at data row ${row}`
          );
        }
        columnType = newType;
      }
      if (!columnType) {
        throw new Error('Unknown column type for column ' + columnName);
      }
      columnDefs.push(Type.buildListFromUnifiedType(columnType, data.length));
    }

    return Type.buildTuple(columnDefs, columnNames);
  });
  ctx.inTable = false;

  return tableType;
}

export function typeFromValue(value: any): Type {
  if (value instanceof Date) {
    // TODO: infer specificity from date?
    const specificity = 'time';
    return Type.buildDate(specificity);
  }
  switch (typeof value) {
    case 'number': {
      return Type.Number;
    }
    case 'string': {
      return Type.String;
    }
    default: {
      throw new Error('Cannot deal with data of type ' + typeof value);
    }
  }
}
