import { Context } from './context';
import { TabularData } from '../data/TabularData';
import { Type, build as t } from '../type';

export async function inferData(
  data: TabularData,
  ctx: Context
): Promise<Type> {
  const tableType = await ctx.stack.withPush(() => {
    const columns: Type[] = [];
    const { columnNames } = data;
    for (const columnName of columnNames) {
      let columnType: Type | undefined;
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
        throw new Error(`Unknown column type for column ${columnName}`);
      }
      columns.push(columnType);
    }

    return t.table({ length: data.length, columns, columnNames });
  });

  return tableType;
}

export function typeFromValue(value: unknown): Type {
  if (value instanceof Date) {
    // TODO: infer specificity from date?
    const specificity = 'time';
    return t.date(specificity);
  }
  switch (typeof value) {
    case 'number': {
      return t.number();
    }
    case 'string': {
      return t.string();
    }
    default: {
      throw new Error(`Cannot deal with data of type ${typeof value}`);
    }
  }
}
