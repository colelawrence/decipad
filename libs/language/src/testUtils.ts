import { readFileSync } from 'fs';

import { AST, Parser, Interpreter, InjectableExternalData } from '.';
import { parse } from './parser';
import { prettyPrintAST } from './parser/utils';
import { Realm, run } from './interpreter';
import { Column, fromJS } from './interpreter/Value';
import { inferTargetStatement, inferProgram, makeContext } from './infer';
import { zip, AnyMapping } from './utils';
import { Type, build as t } from './type';

const parseOneBlock = (source: string): AST.Block => {
  const parserInput: Parser.UnparsedBlock[] = [{ id: 'block-id', source }];
  const [parsed] = parse(parserInput);

  expect(parsed.errors).toEqual([]);

  if (parsed.solutions.length !== 1) {
    const solutions = parsed.solutions.map((s) => prettyPrintAST(s));
    console.error(`Multiple solutions: \n${solutions.join('\n')}`);
    throw new Error('Multiple solutions');
  }
  expect(parsed.solutions.length).toEqual(1);

  return parsed.solutions[0];
};

export const runAST = async (
  block: AST.Block,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const inferResult = await inferTargetStatement(
    [block],
    [0, block.args.length - 1],
    makeContext({ externalData })
  );

  const erroredType = inferResult.errorCause != null ? inferResult : null;
  expect(erroredType).toEqual(null);

  const [value] = await run([block], [0], new Realm({ externalData }));

  return {
    value,
    type: inferResult,
  };
};

export const runCode = async (
  source: string,
  { externalData }: { externalData?: AnyMapping<InjectableExternalData> } = {}
) => {
  const block = parseOneBlock(source);

  return runAST(block, { externalData });
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const program = [parseOneBlock(source)];

  const inferResult = await inferProgram(program);

  const types = Object.fromEntries(inferResult.variables.entries());

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

export const objectToTableType = (length: number, obj: Record<string, Type>) =>
  t.table({
    length,
    columnTypes: Object.values(obj),
    columnNames: Object.keys(obj),
  });

export const objectToTupleValue = (
  obj: Record<string, Interpreter.OneResult>
) => {
  const values = Object.values(obj).map((v) => fromJS(v));

  return Column.fromNamedValues(values, Object.keys(obj)).getData();
};

type ObjectOf<V> = {
  [key: string]: V;
};
export const objectToMap = <K extends string, V, Obj extends ObjectOf<V>>(
  obj: Obj
): Map<K, V> => new Map(Object.entries(obj) as [key: K, val: V][]);

// External data utils

export function readFile(path: string): Buffer {
  return readFileSync(path);
}

export function dataUrl(data: Buffer | string, contentType: string): string {
  return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
}
