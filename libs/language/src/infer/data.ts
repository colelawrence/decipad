import { getDefined } from '@decipad/utils';
import { Context } from './context';
import { DataTable, toInternalType } from '../data/DataTable';
import { Type, build as t } from '../type';

export async function inferData(data: DataTable, ctx: Context): Promise<Type> {
  const tableType = await ctx.stack.withPush(() => {
    const columns: Type[] = [];
    const columnNames: string[] = [];
    console.log(data);
    for (let colIndex = 0; colIndex < data.numCols; colIndex += 1) {
      const column = getDefined(data.getColumnAt(colIndex));
      const columnType: Type = toInternalType(column.type.toString());
      columns.push(columnType);
      columnNames.push(column.name);
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
