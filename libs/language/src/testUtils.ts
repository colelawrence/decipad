import { AST, InjectableExternalData } from '.';
import { Realm, run } from './interpreter';
import { fromJS, FromJSArg, Table } from './interpreter/Value';
import { inferProgram, inferBlock, makeContext } from './infer';
import { zip, AnyMapping } from './utils';
import { stringifyResult } from './result';
import { Type, build as t } from './type';
import { parseOneBlock } from './run';

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

  const types = Object.fromEntries(inferResult.stack.top.entries());

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
