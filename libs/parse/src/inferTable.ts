import type { Computer, Result, SerializedType } from '@decipad/computer';
import { cleanDate } from '@decipad/computer';
import { varNamify } from '@decipad/utils';
import { columnNameFromIndex } from './columnNameFromIndex';
import { inferColumn } from './inferColumn';
import { parseDate } from './parseDate';
import { Sheet, SpreadsheetColumn, InferTableOptions } from './types';
import { parseBoolean } from './inferBoolean';
import { fasterNumber } from './fasterNumber';

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

const columnToValue = (
  type: SerializedType,
  value: SpreadsheetColumn
): Result.OneResult[] => {
  return value.map((elem) => {
    switch (type?.kind) {
      case 'number':
        return fasterNumber(elem as string | number);
      case 'date':
        return cleanDate(
          BigInt(parseDate(elem as string, type.date)?.date.getTime() ?? 0),
          type.date
        );
      case 'string':
        return (elem as string) ?? '';
      case 'boolean':
        return parseBoolean(elem as string);
      default:
        return elem.toString();
    }
  });
};

const tableToValue = (
  columnTypes: SerializedType[],
  columnValues: SpreadsheetColumn[]
): Result.OneResult[][] => {
  return columnValues.map((col, colIndex) =>
    columnToValue(columnTypes[colIndex], col)
  );
};

export const inferTable = (
  computer: Computer,
  data: Sheet,
  options: InferTableOptions
): Result.Result<'table'> => {
  const { columnNames, columnValues } = withColumnNames(data, options);
  const columnTypes = columnValues.map(
    (col, colIndex): SerializedType =>
      (options.columnTypeCoercions?.[colIndex] as SerializedType) ??
      inferColumn(computer, col, {
        doNotTryExpressionNumbersParse: options.doNotTryExpressionNumbersParse,
        userType: options.columnTypeCoercions?.[colIndex],
      })
  );

  return {
    type: {
      kind: 'table',
      columnTypes,
      columnNames,
      indexName: columnNames[0],
    },
    value: tableToValue(columnTypes, columnValues),
  };
};
