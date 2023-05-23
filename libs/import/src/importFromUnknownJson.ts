import stringify from 'json-stringify-safe';
import { Result, isColumn } from '@decipad/computer';
import { ColIndex, TableCellType } from '@decipad/editor-types';
import { N } from '@decipad/number';
import { columnNameFromIndex, parseBoolean, parseDate } from '@decipad/parse';
import type { ImportOptions } from './import';
import { errorResult } from './utils/errorResult';
import { sameType } from './utils/sameType';
import { selectUsingJsonPath } from './utils/selectUsingJsonPath';
import { rowsToColumns } from './utils/rowsToColumns';
import { normalizeColumnName } from './utils/normalizeColumnName';

const importTableFromArray = (
  arr: Array<unknown>,
  options: ImportOptions
): Result.Result => {
  if (arr.length === 0) {
    return errorResult('Don`t know how to import empty array');
  }
  return importTableFromObject(
    Object.fromEntries(
      arr.map((elem, index) => [columnNameFromIndex(index), elem])
    ),
    options
  );
};

const importFromArray = (
  arr: Array<unknown>,
  options: ImportOptions
): Result.Result => {
  if (arr.length === 0) {
    return {
      type: {
        kind: 'anything',
      },
      value: Result.Unknown,
    };
  }
  if (arr.some((elem) => Array.isArray(elem))) {
    return importTableFromArray(arr, options);
  }
  const results = arr.map((cell) => importFromUnknownJson(cell, options));
  if (!sameType(results.map(({ type }) => type))) {
    return errorResult('not all elements of array are of same type');
  }
  return {
    type: {
      kind: 'column',
      indexedBy: null,
      cellType: results[0].type,
    },
    value: results.map(
      (r) => r.value
    ) as Result.Result<'materialized-column'>['value'],
  };
};

const importTableFromObject = (
  obj: Record<string, unknown>,
  options: ImportOptions
): Result.Result => {
  const values = Object.values(obj);
  if (values.length < 0) {
    return errorResult('Don`t know how to import an empty object');
  }
  const results = values
    .map((value, index) => [index, value])
    .map(([index, value]) =>
      importFromUnknownJson(
        value,
        options,
        options.columnTypeCoercions?.[index as ColIndex]
      )
    );
  const value = results.map((res) => {
    if (res.value == null) {
      return Result.UnknownValue.getData();
    }
    if (isColumn(res.type)) {
      return res.value as Result.Result['value'];
    }
    if (res.type.kind === 'type-error') {
      return res.value as Result.Result['value'];
    }
    return [res.value] as Result.Result['value'];
  }) as Result.Result<'materialized-table'>['value'];

  const columnNames = Object.keys(obj).map(normalizeColumnName);

  const r: Result.Result<'materialized-table'> = {
    type: {
      kind: 'materialized-table',
      columnNames,
      columnTypes: results.map((res) => {
        if (isColumn(res.type)) {
          return res.type.cellType;
        }
        return res.type;
      }),
      indexName: columnNames[0],
    },
    value,
  };

  return r as Result.Result;
};

interface ToStringable {
  toString: () => string;
}

const internalImportFromUnknownJson = (
  _json: unknown,
  { jsonPath, ...options }: ImportOptions,
  cohersion?: TableCellType
): Result.Result => {
  const json = jsonPath ? selectUsingJsonPath(_json, jsonPath) : _json;
  if (Array.isArray(json)) {
    return importFromArray(json, options);
  }
  const tof = typeof json;

  if (cohersion?.kind === 'string') {
    return {
      type: {
        ...cohersion,
      },
      value: (json as ToStringable).toString(),
    };
  }

  if ((tof === 'number' || tof === 'bigint') && cohersion?.kind === 'date') {
    return {
      type: {
        ...cohersion,
      },
      value: BigInt(json as number),
    };
  }

  if (
    tof === 'number' ||
    tof === 'bigint' ||
    (tof === 'string' && cohersion?.kind === 'number')
  ) {
    return {
      type: {
        kind: 'number',
        unit: null,
      },
      value: N(json as number | bigint | string),
    };
  }
  if (
    tof === 'boolean' ||
    (tof === 'string' && cohersion?.kind === 'boolean')
  ) {
    return {
      type: {
        kind: 'boolean',
      },
      value:
        tof === 'boolean' ? (json as boolean) : parseBoolean(json as string),
    };
  }
  if (tof === 'string') {
    const value = (json as string).trim();
    if (value) {
      if (cohersion?.kind === 'date') {
        const date = parseDate(value, cohersion.date);
        if (date) {
          return {
            type: { ...cohersion },
            value: date.date,
          };
        }
      }
      return {
        type: {
          kind: 'string',
        },
        value: json as string,
      };
    }
    return {
      type: {
        kind: 'anything',
      },
      value: Result.Unknown,
    };
  }
  if (tof === 'object' && json != null) {
    return importTableFromObject(json as Record<string, unknown>, options);
  }
  throw new Error(`Don't know what to do with ${stringify(_json)}`);
};

export const importFromUnknownJson = (
  json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Result.Result =>
  rowsToColumns(internalImportFromUnknownJson(json, options, cohersion));
