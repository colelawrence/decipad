import { readFileSync } from 'fs';

import { AST, Parser, Interpreter } from '.';
import { parse } from './parser';
import { prettyPrintAST } from './parser/utils';
import { run } from './interpreter';
import { Column, fromJS } from './interpreter/Value';
import { inferTargetStatement, inferProgram } from './infer';
import { zip } from './utils';
import { Type, build as t } from './type';

const parseOneBlock = (source: string): AST.Block[] => {
  const parserInput: Parser.UnparsedBlock[] = [{ id: 'block-id', source }];
  const [parsed] = parse(parserInput);

  expect(parsed.errors).toEqual([]);

  if (parsed.solutions.length !== 1) {
    const solutions = parsed.solutions.map((s) => prettyPrintAST(s));
    console.error(`Multiple solutions: \n${solutions.join('\n')}`);
    throw new Error('Multiple solutions');
  }
  expect(parsed.solutions.length).toEqual(1);

  return [parsed.solutions[0]];
};

export const runCode = async (source: string) => {
  const program = parseOneBlock(source);

  const inferResult = await inferTargetStatement(program, [
    0,
    program[0].args.length - 1,
  ]);

  const erroredType = inferResult.errorCause != null ? inferResult : null;
  expect(erroredType).toEqual(null);

  const value = await run(program, [0]);

  return {
    value,
    type: inferResult,
  };
};

export const runCodeForVariables = async (
  source: string,
  wantedVariables: string[]
) => {
  const program = parseOneBlock(source);

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

export const objectToTupleType = (obj: Record<string, Type>) => {
  const names = [];
  const values = [];

  for (const [name, value] of Object.entries(obj)) {
    names.push(name);
    values.push(value);
  }

  return t.tuple(values, names);
};

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
