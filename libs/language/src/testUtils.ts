import stringify from 'json-stringify-safe';
import pTime from 'p-time';
import DeciNumber, { N } from '@decipad/number';
import type { AnyMapping } from '@decipad/utils';
import {
  getDefined,
  zip,
  produce,
  anyMappingToMap,
  identity,
} from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  Type,
  Unit,
  Value,
  materializeOneResult,
  serializeType,
  buildType as t,
  isErrorType,
} from '@decipad/language-types';
import type { AST, Result, SerializedType } from '@decipad/language-interfaces';
import type { TScopedRealm } from '.';
import { ScopedRealm, makeInferContext, parseBlockOrThrow } from '.';
import { inferBlock, inferProgram } from './infer';
import { getErrSpec } from './type/getErrorSpec';
import type { FromJSArg } from '../../language-types/src/Value';
import { fromJS, getColumnLike } from '../../language-types/src/Value';
import { functionCallValue, run } from './interpreter';

export const runAST = async (
  block: AST.Block,
  { externalData }: { externalData?: AnyMapping<Result.Result> } = {}
) => {
  const ctx = makeInferContext({
    externalData: anyMappingToMap(externalData ?? {}),
  });
  const realm = new ScopedRealm(undefined, ctx);

  const inferResult = await inferBlock(block, realm);

  const erroredType = isErrorType(inferResult) ? inferResult : null;
  expect(erroredType).toEqual(null);

  const [value] = await run([block], [0], new ScopedRealm(undefined, ctx));

  return {
    value: await materializeOneResult(value),
    type: inferResult,
  };
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const program = [parseBlockOrThrow(source)];

  const realm: TScopedRealm = new ScopedRealm(
    undefined,
    makeInferContext(),
    'runCode',
    {
      callValue: async (...args) => functionCallValue(realm, ...args),
    }
  );
  const inferResult = await inferProgram(program, realm);

  const types = Object.fromEntries(inferResult.stack.globalVariables.entries());

  const erroredType = Object.values(types).find(getErrSpec);
  if (erroredType != null) {
    throw new Error(
      `runCodeForVariables found an error\n${stringify(
        erroredType,
        null,
        '\t'
      )}`
    );
  }

  const variables = await run(program, wantedVariables, realm);

  return {
    types,
    variables: Object.fromEntries(zip(wantedVariables, variables)),
  };
};

const userValue = (type: Type, value: Result.OneResult): Result.OneResult => {
  if (value instanceof DeciNumber) {
    const units = Unit.normalizeUnits(type.unit);
    return Unit.convertToMultiplierUnit(value, units);
  }
  return value;
};

interface TypeAndValuePair {
  type: Type | SerializedType;
  value: Result.OneResult;
}

const typeAndValuePairs = (
  types: Record<string, Type>,
  values: Record<string, Result.OneResult>,
  valueAsUser = true,
  typeAsUser = false
): Record<string, TypeAndValuePair> => {
  const keys = new Set(Object.keys(types));
  for (const key of Object.keys(values)) {
    keys.add(key);
  }
  const pairs: [string, TypeAndValuePair][] = [];
  for (const key of keys) {
    const type = types[key];
    const value = values[key];
    pairs.push([
      key,
      {
        type: typeAsUser ? serializeType(type) : type,
        value: valueAsUser ? userValue(type, value) : value,
      },
    ]);
  }

  return Object.fromEntries(pairs);
};

interface EvaluateForVariablesOptions {
  valuesAsUser?: boolean;
  typesAsUser?: boolean;
}

export const evaluateForVariables = async (
  source: string,
  wantedVariables: string[],
  { valuesAsUser = true, typesAsUser = false }: EvaluateForVariablesOptions = {}
) => {
  const program = [parseBlockOrThrow(source)];

  const realm = new ScopedRealm(
    undefined,
    makeInferContext(),
    'evaluateForVariables',
    {
      retrieveHumanVariableNameByGlobalVariableName: identity,
    }
  );
  const inferResult = await inferProgram(program, realm);

  const types = Object.fromEntries(inferResult.stack.globalVariables.entries());

  const erroredType = Object.values(types).find(getErrSpec);
  if (erroredType != null) {
    throw new Error(
      `evaluateForVariables found an error ${
        erroredType.errorCause?.spec.errType
      } \n${stringify(erroredType.errorCause, null, '\t')}`
    );
  }

  const variables = await run(program, wantedVariables, realm);

  return typeAndValuePairs(
    types,
    Object.fromEntries(zip(wantedVariables, variables)),
    valuesAsUser,
    typesAsUser
  );
};

export const objectToTableType = (
  indexName: string,
  obj: Record<string, Type>
) =>
  t.table({
    indexName,
    columnTypes: Object.values(obj).map(
      produce((t) => {
        t.indexedBy = indexName;
      })
    ),
    columnNames: Object.keys(obj),
    delegatesIndexTo: indexName,
  });

export const objectToTableValue = async (
  obj: Record<string, Value.FromJSArg[]>
) => {
  const values = Object.values(obj).map((v) => Value.fromJS(v));

  return Value.Table.fromNamedColumns(values, Object.keys(obj)).getData();
};

type ObjectOf<V> = {
  [key: string]: V;
};
export const objectToMap = <K extends string, V, Obj extends ObjectOf<V>>(
  obj: Obj
): Map<K, V> => new Map(Object.entries(obj) as [key: K, val: V][]);

// External data utils

export function dataUrl(data: Buffer | string, contentType: string): string {
  return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
}

/** Stringify units (for testing/snapshots ONLY) */
export const snapshotUnit = (unit: Unit.Unit[]) => {
  return unit
    .map((u) => {
      const exp = N(u.exp).valueOf();

      if (exp !== 1) {
        return `${u.unit}^${exp}`;
      } else {
        return u.unit;
      }
    })
    .join('.');
};

/** Stringify types (for testing/snapshots ONLY) */
// eslint-disable-next-line complexity
export const snapshotType = (type: Type | SerializedType): string => {
  if (type instanceof Type) {
    type = serializeType(type);
  }

  if (type.kind === 'anything') {
    return type.symbol || 'anything';
  }

  switch (type.kind) {
    case 'string':
    case 'boolean':
    case 'nothing':
    case 'pending':
    case 'function': {
      return type.kind;
    }

    case 'number': {
      const precision = type.numberError ? '~' : '';
      if (type.numberFormat) {
        return precision + type.numberFormat;
      } else if (type.unit) {
        return precision + snapshotUnit(type.unit);
      } else {
        return `${precision}number`;
      }
    }

    case 'materialized-table':
    case 'table': {
      const colsPairs = zip(type.columnNames, type.columnTypes).map(
        ([name, colType]) => `${name} = ${snapshotType(colType)}`
      );
      return `table<${colsPairs.join(', ')}>`;
    }

    case 'materialized-column':
    case 'column': {
      let contents = snapshotType(type.cellType);

      if (type.indexedBy != null) {
        contents += `, indexed by ${type.indexedBy}`;
      }

      return `column<${contents}>`;
    }

    case 'range': {
      return `range<${snapshotType(type.rangeOf)}>`;
    }

    case 'row': {
      return `row<${type.rowCellTypes.map((t) => snapshotType(t)).join(', ')}>`;
    }

    case 'date': {
      return `date<${type.date}>`;
    }

    case 'tree': {
      return `tree`;
    }

    case 'type-error': {
      return `InferError ${type.errorCause.errType}`;
    }
  }
};

export const fromDate = (s: string): bigint => {
  try {
    return BigInt(new Date(s).getTime());
  } catch (err) {
    console.error(err);
    throw new Error(`Error caught converting "${s}" to date`);
  }
};

// export const typeSnapshotSerializer: jest.SnapshotSerializerPlugin = {
//   test: (item) => item instanceof Type || isSerializedType(item),
//   serialize: (item: Type) => {
//     return snapshotType(item);
//   },
// };

export const runAndMeasure = async <T>(
  fn: () => Promise<T>
): Promise<[T, number]> => {
  const p = pTime(fn)();
  return [await p, getDefined(p.time)];
};

export const jsCol = (items: FromJSArg) => getColumnLike(fromJS(items));
