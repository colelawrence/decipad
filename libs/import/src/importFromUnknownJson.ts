import type { Result } from '@decipad/remote-computer';
import {
  isColumn,
  Unknown,
  buildResult,
  getRemoteComputer,
  hydrateResult,
} from '@decipad/remote-computer';
import type { ColIndex, TableCellType } from '@decipad/editor-types';
import { columnNameFromIndex, inferBoolean, inferNumber } from '@decipad/parse';
import stringify from 'json-stringify-safe';
import type { ImportOptions } from './import';
import { errorResult } from './utils/errorResult';
import { normalizeColumnName } from './utils/normalizeColumnName';
import { rowsToColumns } from './utils/rowsToColumns';
import { sameType } from './utils/sameType';
import { selectUsingJsonPath } from './utils/selectUsingJsonPath';
import omit from 'lodash.omit';

const importTableFromArray = async (
  arr: Array<unknown>,
  options: ImportOptions
): Promise<Result.Result> => {
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

const importFromArray = async (
  arr: Array<unknown>,
  options: ImportOptions,
  cohersion?: TableCellType
): Promise<Result.Result> => {
  if (arr.length === 0) {
    return {
      type: {
        kind: 'anything',
      },
      value: Unknown,
    };
  }

  if (arr.some((elem) => Array.isArray(elem))) {
    return importTableFromArray(arr, options);
  }

  const results = await Promise.all(
    arr.map((cell) => importFromUnknownJson(cell, options, cohersion))
  );

  if (!sameType(results.map(({ type }) => type))) {
    return buildResult(
      {
        kind: 'column',
        indexedBy: null,
        cellType: {
          kind: 'string',
        },
      },
      results.map((r) => r.value as Result.OneResult),
      false
    ) as Result.Result;
  }

  return buildResult(
    {
      kind: 'column',
      indexedBy: null,
      cellType: results[0].type,
    },
    results.map((r) => r.value as Result.OneResult),
    false
  ) as Result.Result;
};

const importTableFromObject = async (
  obj: object,
  options: ImportOptions
): Promise<Result.AnyResult> => {
  const values = Object.values(obj);
  if (values.length < 0) {
    return errorResult('Don`t know how to import an empty object');
  }

  const results = await Promise.all(
    values
      .map((value, index) => [index, value])
      .map(([index, value]) =>
        importFromUnknownJson(
          value,
          options,
          options.columnTypeCoercions?.[index as ColIndex]
        )
      )
  );

  const value = results.map((res) => {
    if (res.value == null) {
      return Unknown;
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

  return buildResult(
    {
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
    false
  );
};

const importSingleValueWithCohersion = async (
  value: bigint | number | boolean | string,
  cohersion: TableCellType
): Promise<Result.Result> => {
  switch (cohersion.kind) {
    case 'string':
      return {
        type: {
          kind: 'string',
        },
        value: value.toString(),
      };
    case 'date': {
      let unixDate = 0n;
      if (typeof value === 'string') {
        let parsedDate = new Date(value);
        if (parsedDate.toString() === 'Invalid Date') {
          parsedDate = new Date(0);
        }

        unixDate = BigInt(parsedDate.getTime());
      } else if (typeof value === 'boolean') {
        unixDate = BigInt(new Date(0).getTime());
      } else {
        unixDate = BigInt(value);
      }

      return {
        type: cohersion,
        value: unixDate,
      };
    }
    case 'number': {
      let newValue = value;
      if (typeof value === 'boolean') {
        newValue = value ? '1' : '0';
      }

      return {
        type: cohersion,
        value: newValue.toString(),
      };
    }

    case 'boolean': {
      const booleanValue = Boolean(value);

      return {
        type: cohersion,
        value: booleanValue,
      };
    }
    default: {
      throw new Error(
        `Don't know what to do with cohersion of ${stringify(cohersion)}`
      );
    }
  }
};

const importSingleValue = async (
  value: bigint | number | boolean | string
): Promise<Result.Result> => {
  switch (typeof value) {
    case 'bigint':
    case 'number':
      return {
        type: {
          kind: 'number',
          unit: null,
        },
        value: value.toString(),
      };
    case 'boolean':
      return {
        type: {
          kind: 'boolean',
        },
        value: Boolean(value),
      };
    case 'string': {
      const inferredBoolean = inferBoolean(value);

      if (inferredBoolean != null) {
        return {
          type: inferredBoolean.type,
          value: Boolean(value.toLowerCase()),
        };
      }

      const inferredType = await inferNumber(getRemoteComputer(), value);

      if (inferredType == null) {
        return {
          type: {
            kind: 'string',
          },
          value,
        };
      }

      return {
        type: inferredType.type,
        value: value.replaceAll(/[^0-9.]*/g, ''),
      };
    }
    default: {
      throw new Error('Reached default, shouldnt happen');
    }
  }
};

const internalImportFromUnknownJson = async (
  _json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Promise<Result.Result> => {
  const json = options.jsonPath
    ? selectUsingJsonPath(_json, options.jsonPath)
    : _json;

  if (Array.isArray(json)) {
    return importFromArray(
      json,
      omit(options, 'columnTypeCoercions'),
      cohersion
    );
  }

  if (
    typeof json === 'undefined' ||
    typeof json === 'symbol' ||
    typeof json === 'function'
  ) {
    throw new Error(`Dont know what to do with ${stringify(typeof json)}`);
  }

  if (typeof json === 'object') {
    if (json == null) {
      throw new Error("Don't know what to do with null");
    }
    return importTableFromObject(json, options);
  }

  const puntedJson = json as bigint | number | boolean | string;

  if (cohersion == null) {
    return importSingleValue(puntedJson);
  }

  if (cohersion != null) {
    return importSingleValueWithCohersion(puntedJson, cohersion);
  }

  throw new Error('Shouldnt reach end of function');
};

export const importFromUnknownJson = async (
  json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Promise<Result.Result> => {
  const hydratedResult = hydrateResult(
    rowsToColumns(await internalImportFromUnknownJson(json, options, cohersion))
  );

  if (hydratedResult == null) {
    throw new Error('Could not hydrate the result');
  }

  return hydratedResult;
};
