import type { Computer, Result, SerializedType } from '@decipad/computer';
import { varNamify } from '@decipad/utils';
import { columnNameFromIndex } from './columnNameFromIndex';
import { inferColumn } from './inferColumn';
import { parseDate } from './parseDate';
import { Sheet, SpreadsheetColumn, InferTableOptions } from './types';
import { fastNumber } from './fastNumber';

interface WithColumnNamesResult {
  columnNames: string[];
  columnValues: Sheet['values'];
}

const withColumnNames = (
  data: Sheet,
  options: InferTableOptions
): WithColumnNamesResult => {
  if (options.useFirstRowAsHeader) {
    return {
      columnNames: data.values.map((column) =>
        varNamify((column[0] ?? '_').toString())
      ),
      columnValues: data.values.map((column) => column.slice(1)),
    };
  }
  return {
    columnNames: data.values.map((_, i) => columnNameFromIndex(i)),
    columnValues: data.values,
  };
};

function toValue(
  columnTypes: SerializedType[],
  columnValues: SpreadsheetColumn[]
): Result.OneResult[][] {
  return columnValues.map((col, colIndex) => {
    const type = columnTypes[colIndex];
    return col.map((elem) => {
      switch (type?.kind) {
        case 'number':
          return fastNumber(elem as number | string);
        case 'date':
          return BigInt(parseDate(elem as string)?.date.getTime() ?? 0);
        case 'string':
          return (elem as string) ?? '';
        default:
          return elem.toString();
      }
    });
  });
}

export const inferTable = async (
  computer: Computer,
  data: Sheet,
  options: InferTableOptions
): Promise<Result.Result<'table'>> => {
  const { columnNames, columnValues } = withColumnNames(data, options);
  const columnTypes = await Promise.all(
    columnValues.map(
      async (col, colIndex): Promise<SerializedType> =>
        (options.columnTypeCoercions?.[colIndex] as SerializedType) ??
        inferColumn(computer, col, {
          doNotTryExpressionNumbersParse:
            options.doNotTryExpressionNumbersParse,
          userType: options.columnTypeCoercions?.[colIndex],
        })
    )
  );
  return {
    type: {
      kind: 'table',
      columnTypes,
      columnNames,
      indexName: columnNames[0],
    },
    value: toValue(columnTypes, columnValues),
  };
};
