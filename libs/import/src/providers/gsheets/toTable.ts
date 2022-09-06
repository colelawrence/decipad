import type {
  Result,
  SerializedType,
  SerializedTypes,
} from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { toFraction } from '@decipad/fraction';
import { columnNameFromIndex } from './columnNameFromIndex';
import {
  parseDate,
  dateGranularityFromString,
  highestDateGranularity,
} from '../date';
import type { Column, Sheet } from './types';

export function toTable(data: Sheet): Result.Result<'table'> {
  const columns = data.values;
  const columnNames = columns.map((_, i) => columnNameFromIndex(i));
  const columnTypes = columns.map(columnType);
  return {
    type: {
      kind: 'table',
      tableLength: tableLength(columns),
      columnTypes,
      columnNames,
      indexName: columnNames[0],
    },
    value: toValue(columnTypes, columns),
  };
}

function tableLength(columns: Column[]): number {
  return Math.max(...columns.map((col) => col.length));
}

function toValue(
  columnTypes: SerializedType[],
  columnValues: Column[]
): Result.OneResult[][] {
  return columnValues.map((col, colIndex) => {
    const type = columnTypes[colIndex];
    return col.map((elem) => {
      switch (type.kind) {
        case 'number':
          return toFraction(elem as number);
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

function columnType(column: Column): SerializedType {
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
        coalesce({ kind: 'nothing' });
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
