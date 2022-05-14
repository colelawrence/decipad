import FFraction from '@decipad/fraction';
import { AnyMapping, zip } from '@decipad/utils';
import { AST, InjectableExternalData } from '.';
import { inferBlock, inferProgram, makeContext } from './infer';
import { Realm, run } from './interpreter';
import { fromJS, FromJSArg, Table } from './interpreter/Value';
import { OneResult, stringifyResult } from './result';
import { parseOneBlock } from './run';
import {
  build as t,
  convertToMultiplierUnit,
  normalizeUnitsOf,
  Type,
} from './type';

export const runAST = async (
  block: AST.Block,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const ctx = makeContext({ externalData });

  const inferResult = await inferBlock(block, ctx);

  const erroredType = inferResult.errorCause != null ? inferResult : null;
  expect(erroredType).toEqual(null);

  const [value] = await run([block], [0], new Realm(ctx));

  return {
    value,
    type: inferResult,
  };
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const program = [parseOneBlock(source)];

  const inferResult = await inferProgram(program);

  const types = Object.fromEntries(inferResult.stack.globalVariables.entries());

  const erroredType = Object.values(types).find((t) => t.errorCause != null);
  if (erroredType != null) {
    throw new Error(
      `runCodeForVariables found an error\n${erroredType.toString()}`
    );
  }

  const variables = await run(program, wantedVariables);

  return {
    types,
    variables: Object.fromEntries(zip(wantedVariables, variables)),
  };
};

const userValue = (type: Type, value: OneResult): OneResult => {
  if (value instanceof FFraction) {
    const units = normalizeUnitsOf(type.unit);
    return convertToMultiplierUnit(value, units);
  }
  return value;
};

interface TypeAndValuePair {
  type: Type;
  value: OneResult;
}

const typeAndValuePairs = (
  types: Record<string, Type>,
  values: Record<string, OneResult>,
  asUser = true
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
        type,
        value: asUser ? userValue(type, value) : value,
      },
    ]);
  }

  return Object.fromEntries(pairs);
};

export const evaluateForVariables = async (
  source: string,
  wantedVariables: string[],
  asUser = true
) => {
  const program = [parseOneBlock(source)];

  const inferResult = await inferProgram(program);

  const types = Object.fromEntries(inferResult.stack.globalVariables.entries());

  const erroredType = Object.values(types).find((t) => t.errorCause != null);
  if (erroredType != null) {
    throw new Error(
      `runCodeForVariables found an error\n${erroredType.toString()}`
    );
  }

  const variables = await run(program, wantedVariables);

  return typeAndValuePairs(
    types,
    Object.fromEntries(zip(wantedVariables, variables)),
    asUser
  );
};

export const objectToTableType = (
  indexName: string,
  length: number,
  obj: Record<string, Type>
) =>
  t.table({
    indexName,
    length,
    columnTypes: Object.values(obj),
    columnNames: Object.keys(obj),
  });

export const objectToTableValue = (obj: Record<string, FromJSArg[]>) => {
  const values = Object.values(obj).map((v) => fromJS(v));

  return Table.fromNamedColumns(values, Object.keys(obj)).getData();
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

export const resultSnapshotSerializer: jest.SnapshotSerializerPlugin = {
  test: (arg) => arg?.type instanceof Type && arg.value != null,
  serialize: ({ type, value }) =>
    `Result(${stringifyResult(value, type, (x) => x)})`,
};

export const typeSnapshotSerializer: jest.SnapshotSerializerPlugin = {
  test: (item) => item instanceof Type,
  serialize: (item: Type) => item.toString(),
};
