import {
  Computer,
  Result,
  SerializedType,
  memoizedColumnResultGenerator,
  cleanDate,
} from '@decipad/computer';
import { varNamify } from '@decipad/utils';
import { slice } from '@decipad/generator-utils';
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

const columnToValue = async function* columnToValue(
  type: SerializedType,
  value: SpreadsheetColumn
): AsyncGenerator<Result.OneResult> {
  for (const elem of value) {
    switch (type?.kind) {
      case 'number':
        yield fasterNumber(elem as string | number);
        break;
      case 'date': {
        const parsed = parseDate(elem as string, type.date);
        if (!parsed) {
          yield undefined;
        } else {
          // eslint-disable-next-line no-await-in-loop
          yield cleanDate(parsed.date, type.date);
        }
        break;
      }
      case 'string':
        yield (elem as string) ?? '';
        break;
      case 'boolean':
        yield parseBoolean(elem as string);
        break;
      default:
        yield elem.toString();
    }
  }
};

const tableToValue = (
  columnTypes: SerializedType[],
  columnValues: SpreadsheetColumn[]
): Result.Result<'table'>['value'] => {
  return columnValues.map((col, colIndex) =>
    memoizedColumnResultGenerator((start = 0, end = Infinity) =>
      slice(columnToValue(columnTypes[colIndex], col), start, end)
    )
  );
};

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
    value: tableToValue(columnTypes, columnValues),
  };
};
