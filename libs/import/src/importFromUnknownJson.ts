import { Result } from '@decipad/computer';
import { ColIndex, TableCellType } from '@decipad/editor-types';
import { toFraction } from '@decipad/fraction';
import { columnNameFromIndex, parseBoolean, parseDate } from '@decipad/parse';
import { ImportOptions } from './import';
import { errorResult } from './utils/errorResult';
import { sameType } from './utils/sameType';

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
      value: Result.UnknownValue.getData(),
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
      columnSize: results.length,
    },
    value: results.map((r) => r.value) as Result.Result<'column'>['value'],
  };
};

const importTableFromObject = (
  obj: Record<string, unknown>,
  options: ImportOptions
): Result.Result => {
  const entries = Object.entries(obj);
  if (entries.length < 0) {
    return errorResult('Don`t know how to import an empty object');
  }
  const results = entries
    .map(([, value], index) => [index, value])
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
    if (res.type.kind === 'column') {
      return res.value as Result.Result['value'];
    }
    if (res.type.kind === 'type-error') {
      return res.value as Result.Result['value'];
    }
    return [res.value] as Result.Result['value'];
  }) as Result.Result<'table'>['value'];

  const columnNames = Object.keys(obj);

  const r: Result.Result<'table'> = {
    type: {
      kind: 'table',
      columnNames,
      columnTypes: results.map((res) => {
        if (res.type.kind === 'column') {
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

export const importFromUnknownJson = (
  json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Result.Result => {
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
      value: toFraction(json as number | bigint | string),
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
            value: BigInt(date.date.getTime()),
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
      value: Result.UnknownValue.getData(),
    };
  }
  if (tof === 'object' && json != null) {
    return importTableFromObject(json as Record<string, unknown>, options);
  }
  return {
    type: {
      kind: 'anything',
    },
    value: Result.UnknownValue.getData(),
  };
};
