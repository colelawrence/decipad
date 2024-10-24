/* eslint-disable no-restricted-globals */
import type {
  Result,
  SerializedType,
  SerializedTypes,
} from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildResult, hydrateResult } from '@decipad/computer';
import type { ColIndex, TableCellType } from '@decipad/editor-types';
import {
  columnNameFromIndex,
  inferBoolean,
  inferDate,
  inferNumber,
} from '@decipad/parse';
import stringify from 'json-stringify-safe';
import omit from 'lodash/omit';
import { isValid, parseISO } from 'date-fns';
import type { Computer } from '@decipad/computer-interfaces';
import { isColumn } from '@decipad/computer-utils';
import { errorResult } from './utils/errorResult';
import { normalizeColumnName } from './utils/normalizeColumnName';
import { rowsToColumns } from './utils/rowsToColumns';
import { sameType } from './utils/sameType';
import { selectUsingJsonPath } from './utils/selectUsingJsonPath';
import { N } from '@decipad/number';
import type { ImportOptions } from './types';

const unknownResult: Result.Result = {
  type: {
    kind: 'nothing',
  },
  value: Unknown,
};

const importTableFromArray = async (
  computer: Computer,
  arr: Array<unknown>,
  options: ImportOptions
): Promise<Result.Result> => {
  if (arr.length === 0) {
    return errorResult('Don`t know how to import empty array');
  }

  return importTableFromObject(
    computer,
    Object.fromEntries(
      arr.map((elem, index) => [columnNameFromIndex(index), elem])
    ),
    options
  );
};

const defaultType = (type: TableCellType): Result.OneResult | undefined => {
  switch (type.kind) {
    case 'string':
      return '';
    case 'number':
      return N(undefined);
    case 'date':
      return undefined;
  }
  return undefined;
};

const trySalvagingColumnResultFromUncongruentTypes = (
  results: Array<Result.Result>,
  type?: TableCellType
): [TableCellType | undefined, Result.OneResult[]] | undefined => {
  let congruentType: TableCellType | undefined = type;
  const salvagedResult: Result.OneResult[] = [];

  for (const result of results) {
    const thisType = result.type;
    if (thisType.kind === 'nothing' || result.value == null) {
      if (congruentType != null) {
        const defaulted = defaultType(congruentType);
        if (defaulted != null) {
          salvagedResult.push(defaulted);
          continue;
        }
      }
      return undefined;
    }
    congruentType = thisType as TableCellType;
    salvagedResult.push(result.value as Result.OneResult);
  }
  return [congruentType, salvagedResult];
};

const importFromArray = async (
  computer: Computer,
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
      meta: undefined,
    };
  }

  if (arr.some((elem) => Array.isArray(elem))) {
    return importTableFromArray(computer, arr, options);
  }

  const results = await Promise.all(
    arr.map((cell) => importFromUnknownJson(computer, cell, options, cohersion))
  );

  if (!sameType(results.map(({ type }) => type))) {
    const salvagedResult = trySalvagingColumnResultFromUncongruentTypes(
      results,
      cohersion
    );
    if (salvagedResult) {
      const [salvagedType, salvagedValues] = salvagedResult;
      if (salvagedType != null) {
        return {
          type: {
            kind: 'column',
            indexedBy: null,
            atParentIndex: null,
            cellType: salvagedType as SerializedType,
          },
          value: salvagedValues,
        };
      }
    }
    return buildResult(
      {
        kind: 'column',
        indexedBy: null,
        atParentIndex: null,
        cellType: {
          kind: 'string',
        },
      },
      results.map((r) => r.value as Result.OneResult)
    ) as Result.Result;
  }

  return buildResult(
    {
      kind: 'column',
      indexedBy: null,
      atParentIndex: null,
      cellType: results[0].type,
    },
    results.map((r) => r.value as Result.OneResult)
  ) as Result.Result;
};

const importTableFromObject = async (
  computer: Computer,
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
          computer,
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
      kind: 'table',
      columnNames,
      columnTypes: results.map((res) => {
        if (isColumn(res.type)) {
          return res.type.cellType;
        }
        return res.type;
      }),
      indexName: columnNames[0],
    },
    value
  );
};

const importSingleValueWithCohersion = async (
  value: bigint | number | boolean | string | symbol,
  cohersion: TableCellType
): Promise<Result.Result> => {
  switch (cohersion.kind) {
    case 'string':
      return {
        type: {
          kind: 'string',
        },
        value: value === Unknown ? '' : value.toString(),
        meta: undefined,
      };
    case 'date': {
      let unixDate: bigint | undefined;
      if (typeof value === 'string') {
        let parsedDate = new Date(value);
        if (parsedDate.toString() === 'Invalid Date') {
          parsedDate = new Date(0);
        }

        unixDate = BigInt(parsedDate.getTime());
      } else if (typeof value === 'boolean') {
        unixDate = BigInt(new Date(0).getTime());
      } else {
        unixDate =
          value == null || value === Unknown
            ? undefined
            : BigInt(value as bigint);
      }

      return {
        type: cohersion,
        value: unixDate,
        meta: undefined,
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
        meta: undefined,
      };
    }

    case 'boolean': {
      const booleanValue = Boolean(value);

      return {
        type: cohersion,
        value: booleanValue,
        meta: undefined,
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
  computer: Computer,
  value: bigint | number | boolean | string | null | symbol
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
        meta: undefined,
      };
    case 'boolean':
      return {
        type: {
          kind: 'boolean',
        },
        value: Boolean(value),
        meta: undefined,
      };
    case 'string': {
      if (value.length === 0) {
        return {
          type: {
            kind: 'string',
          },
          value,
          meta: undefined,
        };
      }

      const inferredDate = inferDate(value, 'month') ?? inferDate(value, 'day');
      if (inferredDate != null) {
        const date = new Date(value);
        return {
          type: inferredDate.type,
          value: BigInt(date.getTime()),
          meta: undefined,
        };
      }

      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        return {
          type: {
            kind: 'date',
            date: 'second',
          },
          value: BigInt(parsedDate.getTime()),
          meta: undefined,
        };
      }

      const inferredBoolean = inferBoolean(value);
      if (inferredBoolean != null) {
        return {
          type: inferredBoolean.type,
          value: Boolean(value.toLowerCase()),
          meta: undefined,
        };
      }

      const inferredType = await inferNumber(computer, value, {
        doNotTryExpressionNumbersParse: true,
      });
      const numberType = inferredType?.type as SerializedTypes.Number;

      //
      // The language parses things such as: 'aaa1' as:
      // 1 with unit aaa1
      //
      // So, we just check that.
      // - If the unit is not null.
      // - That the first unit item is not identical to the string.
      //
      // Because if it was, we'd be parsing a weird numbernon.
      //

      if (
        inferredType != null &&
        (numberType.unit == null ||
          (numberType.unit != null && numberType.unit?.at(0)?.unit !== value))
      ) {
        return {
          type: inferredType.type,
          value: value.replaceAll(/[^0-9.]*/g, ''),
          meta: undefined,
        };
      }

      const generalInferredDate = inferDate(value);
      if (generalInferredDate != null) {
        return {
          type: generalInferredDate.type,
          value: BigInt(new Date(value).getTime()),
          meta: undefined,
        };
      }

      return {
        type: {
          kind: 'string',
        },
        value,
        meta: undefined,
      };
    }
    default: {
      throw new Error('Reached default, shouldnt happen');
    }
  }
};

const internalImportFromUnknownJson = async (
  computer: Computer,
  _json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Promise<Result.Result> => {
  const json = options.jsonPath
    ? selectUsingJsonPath(_json, options.jsonPath)
    : _json;

  if (Array.isArray(json)) {
    return importFromArray(
      computer,
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
      return unknownResult;
    }
    return importTableFromObject(computer, json, options);
  }

  const puntedJson = json as bigint | number | boolean | string;

  if (cohersion == null) {
    return importSingleValue(computer, puntedJson);
  }

  return importSingleValueWithCohersion(puntedJson, cohersion);
};

export const importFromUnknownJson = async (
  computer: Computer,
  json: unknown,
  options: ImportOptions,
  cohersion?: TableCellType
): Promise<Result.Result> => {
  const hydratedResult = hydrateResult(
    rowsToColumns(
      await internalImportFromUnknownJson(computer, json, options, cohersion)
    )
  );

  if (hydratedResult == null) {
    throw new Error('Could not hydrate the result');
  }

  return hydratedResult;
};
