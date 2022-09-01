import type {
  Result,
  SerializedType,
  SerializedTypes,
} from '@decipad/computer';
import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { columnNameFromIndex } from './columnNameFromIndex';
import {
  parseDate,
  dateGranularityFromString,
  highestDateGranularity,
} from '../providers/date';
import { Sheet, SpreadsheetColumn } from '../types';
import { ImportOptions } from '../import';

interface WithColumnNamesResult {
  columnNames: string[];
  columnValues: Sheet['values'];
}

const withColumnNames = (
  data: Sheet,
  options: ImportOptions
): WithColumnNamesResult => {
  if (options.useFirstRowAsHeader) {
    return {
      columnNames: data.values.map((column) => column[0].toString()),
      columnValues: data.values.map((column) => column.slice(1)),
    };
  }
  return {
    columnNames: data.values.map((_, i) => columnNameFromIndex(i)),
    columnValues: data.values,
  };
};

export function toTable(
  data: Sheet,
  options: ImportOptions
): Result.Result<'table'> {
  const { columnNames, columnValues } = withColumnNames(data, options);
  const columnTypes = columnValues.map(
    (col, colIndex): SerializedType =>
      (options.columnTypeCoercions?.[colIndex] as SerializedType) ??
      columnType(col)
  );
  return {
    type: {
      kind: 'table',
      tableLength: tableLength(columnValues),
      columnTypes,
      columnNames,
      indexName: columnNames[0],
    },
    value: toValue(columnTypes, columnValues),
  };
}

function tableLength(columns: SpreadsheetColumn[]): number {
  return Math.max(...columns.map((col) => col.length));
}

function toValue(
  columnTypes: SerializedType[],
  columnValues: SpreadsheetColumn[]
): Result.OneResult[][] {
  return columnValues.map((col, colIndex) => {
    const type = columnTypes[colIndex];
    return col.map((elem) => {
      switch (type?.kind) {
        case 'number':
          return new Fraction(elem as number);
        case 'date':
          return BigInt(getDefined(parseDate(elem as string)));
        case 'string':
          return (elem as string) ?? '';
        default:
          return elem.toString();
      }
    });
  });
}

function columnType(column: SpreadsheetColumn): SerializedType {
  let lastType: SerializedType | undefined;
  for (const value of column) {
    switch (typeof value) {
      case 'boolean':
        coalesce({ kind: 'boolean' });
        break;
      case 'number':
        coalesce({ kind: 'number', unit: null });
        break;
      case 'string':
        coalesce(stringTypeFromValue(value));
        break;
      case 'undefined':
      case 'object': // null
        if (value == null) {
          coalesce({ kind: 'nothing' });
        }
        break;
      default:
        throw new Error(`Unexpected type of value: ${typeof value}`);
    }
  }

  return lastType ?? { kind: 'string' };

  function coalesce(newType: SerializedType) {
    if (!lastType) {
      lastType = newType;
    } else if (newType.kind !== lastType.kind) {
      // inconsistent column type: default to string
      if (newType.kind !== 'nothing') {
        lastType = { kind: 'string' };
      }
    } else if (newType.kind === 'date') {
      const lastDateType = lastType as SerializedTypes.Date;
      if (newType.date !== lastDateType.date) {
        const newGranularity = highestDateGranularity(
          lastDateType.date,
          newType.date
        );
        if (newGranularity) {
          lastType = {
            kind: 'date',
            date: newGranularity,
          };
        }
      }
    }
  }
}

function stringTypeFromValue(value: string): SerializedType {
  const date = parseDate(value);
  if (!date) {
    return { kind: 'string' };
  }
  return {
    kind: 'date',
    date: dateGranularityFromString(value),
  };
}
