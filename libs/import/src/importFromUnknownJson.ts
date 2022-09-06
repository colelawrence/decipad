import { Result } from '@decipad/computer';
import { toFraction } from '@decipad/fraction';
import { ImportOptions } from './import';
import { columnNameFromIndex } from './utils/columnNameFromIndex';
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
  const keys = Object.keys(obj);
  if (keys.length < 0) {
    return errorResult('Don`t know how to import an empty object');
  }
  const results = keys
    .map((key) => obj[key])
    .map((o) => importFromUnknownJson(o, options));
  const r: Result.Result<'table'> = {
    type: {
      kind: 'table',
      columnNames: keys,
      columnTypes: results.map((res) => {
        if (res.type.kind === 'column') {
          return res.type.cellType;
        }
        return res.type;
      }),
      tableLength: keys.length,
      indexName: keys[0],
    },
    value: results.map((res) => {
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
    }) as Result.Result<'table'>['value'],
  };

  return r as Result.Result;
};

export const importFromUnknownJson = (
  json: unknown,
  options: ImportOptions
): Result.Result => {
  if (Array.isArray(json)) {
    return importFromArray(json, options);
  }
  const tof = typeof json;
  if (tof === 'number' || tof === 'bigint') {
    return {
      type: {
        kind: 'number',
        unit: null,
      },
      value: toFraction(json as number | bigint),
    };
  }
  if (tof === 'boolean') {
    return {
      type: {
        kind: 'boolean',
      },
      value: json as boolean,
    };
  }
  if (tof === 'string') {
    return {
      type: {
        kind: 'string',
      },
      value: json as string,
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
